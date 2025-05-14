/** @format */

// main.ts
import { ipcMain, IpcMainInvokeEvent, app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

import puppeteer, { Browser, ElementHandle, Page } from "puppeteer-core";

// Constants
const MAX_CONCURRENCY = 3;
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_COMMENT = "Hello livestream 👋";

// Types
interface BrowserProfile {
  browser: Browser;
  page: Page;
  profilePath: string;
}

// State
const browsers: Record<string, BrowserProfile> = {};

// Utility functions
function getRandomUserAgent(): string {
  const osList = [
    "Windows NT 10.0; Win64; x64",
    "Windows NT 6.1; Win64; x64",
    "Macintosh; Intel Mac OS X 10_15_7",
    "X11; Linux x86_64",
  ];
  const chromeMajor = Math.floor(Math.random() * 20) + 100;
  const chromeMinor = Math.floor(Math.random() * 5000) + 1000;
  const chromeBuild = Math.floor(Math.random() * 100);
  const os = osList[Math.floor(Math.random() * osList.length)];
  return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${chromeMinor}.${chromeBuild} Safari/537.36`;
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function cleanLockFiles(profilePath: string): void {
  const lockFiles = ["LOCK", "lockfile", "SingletonLock", "SingletonCookie"];
  for (const file of lockFiles) {
    const lockFilePath = path.join(profilePath, file);
    if (fs.existsSync(lockFilePath)) {
      sendLogToRenderer(`✅ Phát hiện có LOCK file ở path ${profilePath}.`);
      try {
        fs.unlinkSync(lockFilePath);
        sendLogToRenderer(`🗑️ Đã xóa file khóa: ${lockFilePath}`);
      } catch (err) {
        sendLogToRenderer(
          `⚠️ Không thể xóa file khóa: ${(err as Error).message}`
        );
      }
    }
  }
}

function findChromePath(): string | undefined {
  const platform = os.platform();

  if (platform === "win32") {
    const chromePaths = [
      path.join(
        process.env["PROGRAMFILES"] || "",
        "Google/Chrome/Application/chrome.exe"
      ),
      path.join(
        process.env["PROGRAMFILES(X86)"] || "",
        "Google/Chrome/Application/chrome.exe"
      ),
      path.join(
        process.env["LOCALAPPDATA"] || "",
        "Google/Chrome/Application/chrome.exe"
      ),
    ];
    return chromePaths.find(fs.existsSync);
  } else if (platform === "darwin") {
    const chromePath =
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    return fs.existsSync(chromePath) ? chromePath : undefined;
  } else if (platform === "linux") {
    const chromePaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
    ];
    return chromePaths.find(fs.existsSync);
  }
  return undefined;
}

function sendLogToRenderer(log: string): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("update-log", log);
  }
}

async function closeChromeManualToRender(driverId: string): Promise<void> {
  // const closingPromises = Object.values(browsers).map(({ browser }) =>
  //   browser.close()
  // );

  const instance = browsers[driverId];

  await instance.browser.close();
  delete browsers[driverId];
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("close-chrome-manual", driverId);
  }
}

// Browser management functions
async function detectCaptcha(page: Page): Promise<boolean> {
  try {
    // Wait a bit for page to load elements
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const captchaExists = await page.$(".captcha-verify-container-main-page");
    return captchaExists !== null;
  } catch (error) {
    console.error("Error detecting captcha:", error);
    return false;
  }
}

async function enterTextIntoContentEditable(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const timeoutMS = 6000;

  try {
    await page.waitForSelector(selector, { visible: true, timeout: timeoutMS });
    sendLogToRenderer(`🔍 Tìm selector đầu tiên: ${selector}`);

    // Clear existing content
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = "";
    }, selector);

    const el = await page.$(selector);
    if (!el) throw new Error("❌ Không tìm thấy input comment");

    await el.click();
    await el.type(text, { delay: 30 });
    sendLogToRenderer(`⌨️ Đã nhập comment: "${text}"`);

    // Find and click post button
    const postSvgSelector = 'svg path[d^="M45.7321 7.00001"]';
    await page.waitForSelector(postSvgSelector, {
      visible: true,
      timeout: timeoutMS,
    });

    const postBtn = await page.$(postSvgSelector);
    if (!postBtn) throw new Error("❌ Không tìm thấy nút gửi comment");

    const clickableDiv = await postBtn.evaluateHandle((el) =>
      el.closest("div[tabindex='0']")
    );
    if (!clickableDiv) throw new Error("❌ Không tìm thấy nút gửi comment");

    await (clickableDiv as ElementHandle<Element>).click();
    sendLogToRenderer(`✅ Comment đã được gửi thành công!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendLogToRenderer(`❌ Lỗi khi gửi comment: ${message}`);
    throw error;
  }
}

async function openChromeProfile({
  id,
  profilePath,
  proxyPath,
  totalProfile = 1,
  headless = false,
}: {
  id: string;
  profilePath: string;
  proxyPath?: string;
  totalProfile?: number;
  headless?: boolean;
}): Promise<string> {
  const profileName = path.basename(profilePath);
  try {
    // Clean lock files that might prevent browser from opening
    cleanLockFiles(profilePath);

    // Calculate window position and size
    const screenWidth = 1920;
    const screenHeight = 1080;
    const cols = Math.ceil(Math.sqrt(totalProfile));
    const rows = Math.ceil(totalProfile / cols);
    const width = Math.floor(screenWidth / cols);
    const height = Math.floor(screenHeight / rows);

    const index = Object.keys(browsers).length;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * width;
    const y = row * height;

    // Setup user agent
    const userAgentPath = path.join(profilePath, "ua.txt");
    const userAgent = fs.existsSync(userAgentPath)
      ? fs.readFileSync(userAgentPath, "utf-8").trim()
      : getRandomUserAgent();

    if (!fs.existsSync(userAgentPath)) {
      fs.writeFileSync(userAgentPath, userAgent);
    }

    sendLogToRenderer(`✅ Profile Path ${profilePath}.`);

    // Setup browser arguments
    const args = [
      `--user-data-dir=${profilePath}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
      `--window-position=${x},${y}`,
    ];

    if (!headless) {
      args.push(`--window-size=${width},${height}`);
    } else {
      args.push("--window-size=1280,800");
    }

    // Setup proxy if needed
    if (proxyPath) {
      const proxyParts = proxyPath.split(":");
      args.push(`--proxy-server=http://${proxyParts[0]}:${proxyParts[1]}`);
    }

    sendLogToRenderer(`🖥️ Headless: ${headless ? "Có" : "Không"}`);

    // Find Chrome executable
    const chromePath = findChromePath() || puppeteer.executablePath();
    sendLogToRenderer(`🖥️ Đường dẫn chrome Exe: ${chromePath}`);

    // Launch browser
    const browser = await puppeteer.launch({
      headless,
      executablePath: chromePath,
      args,
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      },
    });

    // Handle browser disconnection
    browser.on("disconnected", async () => {
      sendLogToRenderer(`❌ Browser với profile ${profileName} đã đóng.`);
      await closeChromeManualToRender(id);
    });

    // Get or create page
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());
    await page.setUserAgent(userAgent);

    // Authenticate with proxy if credentials provided
    if (proxyPath) {
      const [ip, port, username, password] = proxyPath.split(":");

      if (username && password) {
        await page.authenticate({ username, password });
        sendLogToRenderer(`✅ Có sử dụng proxy và đã xác thực`);
      } else {
        sendLogToRenderer(`✅ Có sử dụng proxy (không có xác thực)`);
      }
    } else {
      sendLogToRenderer(`❌ Không có proxy được sử dụng.`);
    }

    // Navigate to TikTok
    await page.goto("https://tiktok.com", {
      waitUntil: "load",
      timeout: DEFAULT_TIMEOUT,
    });

    // Check for CAPTCHA
    if (await detectCaptcha(page)) {
      sendLogToRenderer(
        `❌ Đã phát hiện CAPTCHA trên profile ${profileName}, bỏ qua profile này.`
      );
      await browser.close();
      return "";
    }

    // Wait for TikTok to load properly
    await page.waitForSelector("div.TUXButton-iconContainer", {
      visible: true,
    });

    // Save browser profile in memory
    browsers[id] = { browser, page, profilePath };

    sendLogToRenderer(`✅ Đã mở profile : ${profileName}`);
    sendLogToRenderer(`--------------------------------`);

    return id;
  } catch (err) {
    sendLogToRenderer(
      `❌ Lỗi mở profile ${profileName} với ID: ${id} : ${
        (err as Error).message
      }`
    );
    return "";
  }
}

// IPC handlers
ipcMain.handle("open-chrome-profile", async (_e, params) => {
  try {
    return await openChromeProfile(params);
  } catch (err) {
    return "";
  }
});

ipcMain.handle(
  "share-livestream",
  async (
    _event: IpcMainInvokeEvent,
    { chromeIDS, linkLive }: { chromeIDS: string[]; linkLive: string }
  ) => {
    sendLogToRenderer(
      `🧮 Tổng cộng số lượng profile sẽ chạy share live: ${chromeIDS.length}`
    );

    // Process in batches to manage concurrency
    const chunks: string[][] = [];
    for (let i = 0; i < chromeIDS.length; i += MAX_CONCURRENCY) {
      chunks.push(chromeIDS.slice(i, i + MAX_CONCURRENCY));
    }

    for (const batch of chunks) {
      await Promise.all(
        batch.map(async (chromeID) => {
          const instance = browsers[chromeID];
          if (!instance) {
            sendLogToRenderer(
              `⚠️ Không tìm thấy instance cho profile để share: ${chromeID}`
            );
            return;
          }

          const { page } = instance;
          const profileName = path.basename(instance.profilePath);

          try {
            sendLogToRenderer(`👤 Bắt đầu chạy share profile: ${profileName}`);

            // Navigate to livestream if needed
            if (page.url() !== linkLive) {
              sendLogToRenderer(`👤 Chuyển hướng đến: ${linkLive}`);
              await page.goto(linkLive, {
                waitUntil: "networkidle2",
                timeout: 60000,
              });
            }

            // Check for CAPTCHA
            if (await detectCaptcha(page)) {
              sendLogToRenderer(
                `❌ Đã phát hiện CAPTCHA trên profile ${profileName}, bỏ qua profile này.`
              );
              await closeChromeManualToRender(chromeID);
              return;
            }

            // Try to share the livestream, which also verifies login status
            try {
              // Check if share icon exists and can be interacted with - this verifies login
              await page.waitForSelector('i[data-e2e="share-icon"]', {
                visible: true,
                timeout: 3000, // Maximum wait time for icon to appear
              });

              await page.hover('i[data-e2e="share-icon"]');

              // Wait for share link to appear after hover
              await page.waitForSelector('a[data-e2e="share-link"][href="#"]', {
                visible: true,
                timeout: 3000, // Maximum wait time for share menu to appear
              });

              await page.click('a[data-e2e="share-link"][href="#"]');
            } catch (error) {
              // If any step fails, user is likely not logged in
              sendLogToRenderer(
                `❌ Profile ${profileName} có thể chưa đăng nhập, không thể share. Lỗi: ${error.message}`
              );
              await closeChromeManualToRender(chromeID);
              return;
            }
            await page.mouse.move(0, 0); // Avoid hovering icon again

            sendLogToRenderer(
              `✅ Đã share thành công ở profile: "${profileName}"`
            );
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : String(err);
            sendLogToRenderer(
              `❌ Lỗi khi share profile ${profileName}: ${errorMessage}`
            );
          }
        })
      );
    }
  }
);

// async function checkIsLoggedIn(page: Page): Promise<boolean> {
//   try {
//     // Check for login button - if it exists, user is not logged in
//     const loginButtonExists = await page.evaluate(() => {
//       const loginButtons = document.querySelectorAll(
//         'button[data-e2e="top-login-button"]'
//       );
//       return loginButtons.length > 0;
//     });

//     if (loginButtonExists) {
//       return false;
//     }

//     // Alternative check: look for avatar or user-specific elements
//     const userAvatarExists = await page.evaluate(() => {
//       // Check for user avatar/profile elements that would only appear when logged in
//       const avatarElements = document.querySelectorAll(
//         'img[data-e2e="user-avatar"], span[data-e2e="user-info"]'
//       );
//       return avatarElements.length > 0;
//     });

//     return userAvatarExists;
//   } catch (error) {
//     console.error("Error checking login status:", error);
//     return false; // Safer to assume not logged in on error
//   }
// }

ipcMain.handle(
  "seeding-livestream-batch",
  async (
    _event: IpcMainInvokeEvent,
    {
      chromeProfileIds,
      comments,

      linkLiveStream,
    }: {
      chromeProfileIds: string[];
      comments: string;

      linkLiveStream: string;
    }
  ) => {
    try {
      // Parse comments and ensure no duplicates
      const commentList = Array.from(
        new Set(
          comments
            .split(/[\n,]/)
            .map((c) => c.trim())
            .filter(Boolean)
        )
      );
      const profileQueue = [...chromeProfileIds];
      const batchSize = 10;

      sendLogToRenderer(`🧮 Tổng số profile: ${profileQueue.length}`);
      sendLogToRenderer(`📝 Tổng số comment: ${commentList.length}`);

      let batchCount = 0;
      while (commentList.length > 0) {
        const batchProfiles = profileQueue.splice(0, batchSize);
        const batchComments = commentList.splice(0, batchSize);

        sendLogToRenderer(
          `🚀 Batch ${++batchCount}: Chạy ${batchProfiles.length} profile với ${
            batchComments.length
          } comment`
        );

        await Promise.all(
          batchProfiles.map(async (profileId, index) => {
            const instance = browsers[profileId];
            if (!instance) {
              sendLogToRenderer(
                `⚠️ Không tìm thấy instance cho profile: ${profileId}`
              );
              return;
            }

            const { page } = instance;
            const profileName = path.basename(instance.profilePath);
            const comment = batchComments[index];

            try {
              sendLogToRenderer(`👤 Đang chạy profile: ${profileName}`);
              await page.goto(linkLiveStream, {
                waitUntil: "networkidle2",
                timeout: 60000,
              });

              // Check for CAPTCHA
              if (await detectCaptcha(page)) {
                sendLogToRenderer(`❌ CAPTCHA trên ${profileName}, bỏ qua`);
                await closeChromeManualToRender(profileId);
                return;
              }

              // Comment on livestream
              await enterTextIntoContentEditable(
                page,
                "div[contenteditable='plaintext-only']",
                comment
              );
              sendLogToRenderer(`✅ ${profileName} đã comment: "${comment}"`);
            } catch (err) {
              sendLogToRenderer(
                `❌ Lỗi với ${profileName}: ${
                  err instanceof Error ? err.message : String(err)
                }`
              );
            }
          })
        );

        // Đợi 1 phút trước khi chạy batch tiếp theo
        sendLogToRenderer(`⏳ Chờ ${1} giây trước khi chạy batch tiếp theo`);
        await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
      }

      sendLogToRenderer(`✅ Hoàn tất seeding livestream`);
    } catch (err) {
      sendLogToRenderer(
        `❌ Lỗi nghiêm trọng: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
);

ipcMain.handle(
  "seeding-livestream",
  async (
    _event: IpcMainInvokeEvent,
    {
      chromeProfileIds,
      comments,
      delay,
      linkLiveStream,
      acceptDupplicateComment,
    }: {
      liveID: string;
      chromeProfileIds: string[];
      comments: string;
      delay: number;
      linkLiveStream: string;
      acceptDupplicateComment: boolean;
    }
  ) => {
    try {
      // Parse comment list
      const commentList = comments
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);

      if (commentList.length === 0) commentList.push(DEFAULT_COMMENT);

      const usedComments = new Set<string>();
      const shuffledProfiles = shuffleArray(chromeProfileIds);

      sendLogToRenderer(`🧮 Tổng số profile: ${shuffledProfiles.length}`);
      sendLogToRenderer(
        `🎯 Chế độ comment: ${
          acceptDupplicateComment ? "✅ Cho phép trùng" : "🚫 Không trùng"
        }`
      );

      // Process a single profile
      const runProfile = async (profileId: string, delayInSeconds: number) => {
        await new Promise((resolve) =>
          setTimeout(resolve, delayInSeconds * 1000)
        ); // Delay before starting

        const instance = browsers[profileId];
        if (!instance) {
          sendLogToRenderer(
            `⚠️ Không tìm thấy instance cho profile: ${profileId}`
          );
          return;
        }

        const { page } = instance;
        const profileName = path.basename(instance.profilePath);

        try {
          sendLogToRenderer(`👤 Đang xử lý: ${profileName}`);

          // Navigate to livestream if needed
          if (page.url() !== linkLiveStream) {
            sendLogToRenderer(`🔁 Điều hướng đến: ${linkLiveStream}`);
            await page.goto(linkLiveStream, {
              waitUntil: "networkidle2",
              timeout: 60000,
            });
          }

          // Check for CAPTCHA
          if (await detectCaptcha(page)) {
            sendLogToRenderer(`❌ CAPTCHA trên ${profileName}, bỏ qua`);
            await closeChromeManualToRender(profileId);
            return;
          }

          // Select a comment
          let comment: string | undefined;
          const maxTries = 5;

          for (let tries = 0; tries < maxTries; tries++) {
            comment =
              commentList[Math.floor(Math.random() * commentList.length)];
            // If we accept duplicates or this is a new comment, we can use it
            if (acceptDupplicateComment || !usedComments.has(comment)) break;
            // On last try, accept duplicate if needed
            if (tries === maxTries - 1) break;
          }

          if (
            !comment ||
            (!acceptDupplicateComment && usedComments.has(comment))
          ) {
            sendLogToRenderer(`⚠️ Trùng comment, bỏ qua: ${profileName}`);
            return;
          }

          // Post the comment
          await enterTextIntoContentEditable(
            page,
            "div[contenteditable='plaintext-only']",
            comment
          );
          usedComments.add(comment);

          sendLogToRenderer(`✅ ${profileName} đã comment: "${comment}"`);
          sendLogToRenderer(`----------------------------------`);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          sendLogToRenderer(`❌ Lỗi với ${profileName}: ${errorMsg}`);
        }
      };

      // Process profiles in batches
      const chunks: string[][] = [];
      for (let i = 0; i < shuffledProfiles.length; i += MAX_CONCURRENCY) {
        chunks.push(shuffledProfiles.slice(i, i + MAX_CONCURRENCY));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((profileId, index) => runProfile(profileId, index * delay))
        );
      }

      sendLogToRenderer(`✅ Hoàn tất seeding livestream`);
      sendLogToRenderer(`----------------------------------`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      sendLogToRenderer(`❌ Lỗi nghiêm trọng: ${errorMessage}`);
    }
  }
);

ipcMain.handle("close-chrome-profile", async (_e, id: string) => {
  const instance = browsers[id];
  if (!instance) return false;

  await instance.browser.close();
  delete browsers[id];
  return true;
});

ipcMain.handle("delete-chrome-profile", (_e, profilePath: string) => {
  const profileName = path.basename(profilePath);

  if (fs.existsSync(profilePath)) {
    fs.rmSync(profilePath, { recursive: true, force: true });
    sendLogToRenderer(`Đã xóa profile : ${profileName} `);
    sendLogToRenderer(`----------------------------------`);
    return true;
  }

  return false;
});

ipcMain.handle("load-audio", async (_event, filePath: string) => {
  try {
    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString("base64");
    const ext = path.extname(filePath).substring(1); // "mp3"
    const dataUrl = `data:audio/${ext};base64,${base64Audio}`;

    sendLogToRenderer(`Đã load audio ở đường dẫn ${filePath}`);
    sendLogToRenderer(`----------------------------------`);

    return dataUrl;
  } catch (error) {
    sendLogToRenderer(`❌ Lỗi khi load audio: ${(error as Error).message}`);
    return null;
  }
});

ipcMain.handle(
  "create-chrome-profile",
  async (_e, { profileName, profilePath }) => {
    const fullProfilePath = path.join(profilePath, profileName);

    // Create profile directory if it doesn't exist
    if (!fs.existsSync(fullProfilePath)) {
      fs.mkdirSync(fullProfilePath, { recursive: true });
    }

    // Find Chrome path
    const chromePath = findChromePath() || puppeteer.executablePath();
    if (!chromePath) {
      throw new Error("Không thể tìm thấy Chrome hoặc Chromium trên máy.");
    }

    // Initialize the profile
    try {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: chromePath,
        userDataDir: fullProfilePath,
        args: ["--no-first-run", "--no-default-browser-check"],
      });

      const page = await browser.newPage();
      await page.goto("https://example.com", { waitUntil: "networkidle2" });
      await browser.close();

      sendLogToRenderer(`Đã tạo mới profile tại đường dẫn ${fullProfilePath}`);
      sendLogToRenderer(`----------------------------------`);

      return fullProfilePath;
    } catch (error) {
      sendLogToRenderer(`❌ Lỗi khi tạo profile: ${(error as Error).message}`);
      throw error;
    }
  }
);

// App lifecycle
app.on("before-quit", async (e) => {
  e.preventDefault();

  // Close all browsers before quitting
  const closingPromises = Object.values(browsers).map(({ browser }) =>
    browser.close()
  );
  await Promise.all(closingPromises);

  app.quit();
});
