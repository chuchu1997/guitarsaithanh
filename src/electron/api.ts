/** @format */

// main.ts
import { ipcMain, IpcMainInvokeEvent, app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

import puppeteer, {
  Browser,
  ElementHandle,
  Page,
  launch,
} from "puppeteer-core";
// eslint-disable-next-line import/default
const CHROME_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

interface BrowserProfile {
  browser: Browser;
  page: Page;
  profilePath: string;
}

const browsers: Record<string, BrowserProfile> = {};

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

async function openChromeProfile({
  id,
  profilePath,
  proxyPath,
  linkOpenChrome,
  totalProfile,
  headless,
}: {
  id: string;
  profilePath: string;
  proxyPath?: string;
  linkOpenChrome?: string;
  totalProfile?: number;
  headless?: boolean;
}): Promise<{ driverId: string } | null> {
  const profileName = path.basename(profilePath); // "cuong guitar"

  try {
    const screenWidth = 1920;
    const screenHeight = 1080;
    const total = totalProfile ?? 1;

    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const width = Math.floor(screenWidth / cols);
    const height = Math.floor(screenHeight / rows);

    const index = Object.keys(browsers).length;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * width;
    const y = row * height;

    const userAgentPath = path.join(profilePath, "ua.txt");
    const userAgent = fs.existsSync(userAgentPath)
      ? fs.readFileSync(userAgentPath, "utf-8").trim()
      : getRandomUserAgent();

    if (!fs.existsSync(userAgentPath)) {
      fs.writeFileSync(userAgentPath, userAgent);
    }

    const args = [
      `--user-data-dir=${profilePath}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-blink-features=AutomationControlled",
      // `--window-size=${width},${height}`,
      `--window-position=${x},${y}`,
    ];
    if (!headless) {
      args.push(`--window-size=${width},${height}`);
    } else {
      args.push("--window-size=1280,800");
    }

    if (proxyPath) {
      const [ip, port] = proxyPath.split(":");
      args.push(`--proxy-server=http://${ip}:${port}`);
    }

    sendLogToRenderer(`🖥️ Headless: ${headless ? "Có" : "Không"}`);


    let chromePath = findChromePath();
    if (!chromePath) {
      chromePath = puppeteer.executablePath();
    }
  
    // const browser: Browser = await launch({
    //   headless: false,
    //   executablePath: chromePath,
    //   userDataDir: fullProfilePath,
    //   args: ["--no-first-run", "--no-default-browser-check"],
    // });


    const browser = await launch({
      headless: headless,
      executablePath: chromePath,
      args,
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      },
    });

    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());

    await page.setUserAgent(userAgent);

    if (proxyPath) {
      const [, , username, password] = proxyPath.split(":");
      await page.authenticate({ username, password });
      sendLogToRenderer(`✅ Có sử dụng proxy và đã xác thực`); // Gửi log nếu có sử dụng proxy
    } else {
      sendLogToRenderer(`❌ Không có proxy được sử dụng.`);
    }

    await page.goto("https://tiktok.com", {
      waitUntil: "load",
      timeout: 30000, // nếu quá 30s thì bỏ qua
    });

    const avatar = await page.$("div.TUXButton-iconContainer img");

    // Nếu có avatar → Đã đăng nhập
    const isLoggedIn = avatar !== null;

    if (isLoggedIn) {
      sendLogToRenderer(
        `✅ Trạng thái đăng nhập: (Đã đăng nhập) : ${profileName}`
      );
    } else {
      sendLogToRenderer(
        `❌ Trạng thái đăng nhập: (Chưa đăng nhập) : ${profileName}`
      );

      try {
        await page.waitForSelector("#header-login-button", { timeout: 5000 });
        await page.evaluate(() => {
          const loginButton = document.querySelector("#header-login-button");
          if (loginButton) (loginButton as HTMLElement).click();
        });
      } catch (error) {
        sendLogToRenderer(`⚠️ Lỗi khi cố gắng đăng nhập: ${error}`);
      }
    }
    browsers[id] = { browser, page, profilePath };

    sendLogToRenderer(`✅ Đã mở profile : ${profileName}`);

    sendLogToRenderer(`--------------------------------`);

    return { driverId: id };
  } catch (err) {
    sendLogToRenderer(
      `❌ Lỗi mở profile ${profileName} với ID: ${id} : ${
        (err as Error).message
      }`
    );
    return null;
  }
}

async function enterTextIntoContentEditable(
  page: Page,
  selector: string,
  text: string
) {
  // Đảm bảo rằng phần tử đã sẵn sàng để tương tác
  try {
    await page.waitForSelector(selector, { visible: true });
    sendLogToRenderer(`🔍 Tìm selector đầu tiên: ${selector}`);

    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = "";
    }, selector);

    const el = await page.$(selector);
    sendLogToRenderer(`🔍 Tìm input comment: ${el}`);

    if (!el) throw new Error("❌ Không tìm thấy input comment");

    await el.click();
    sendLogToRenderer(`🖱️ Đã click vào input comment`);

    await el.type(text, { delay: 30 });
    sendLogToRenderer(`⌨️ Đã nhập comment: "${text}"`);

    const postSvgSelector = 'svg path[d^="M45.7321 7.00001"]';
    await page.waitForSelector(postSvgSelector, { visible: true });
    sendLogToRenderer(`🔍 Tìm nút gửi comment`);

    const postBtn = await page.$(postSvgSelector);
    if (!postBtn) throw new Error("❌ Không tìm thấy nút gửi comment");

    const clickableDiv = await postBtn.evaluateHandle((el) => {
      return el.closest("div[tabindex='0']");
    });

    if (!clickableDiv) throw new Error("❌ Không tìm thấy nút gửi comment");

    await (clickableDiv as ElementHandle<Element>).click();
    sendLogToRenderer(`✅ Comment đã được gửi thành công!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendLogToRenderer(`❌ Lỗi khi gửi comment: ${message}`);
    throw error; // Nếu cần dừng tiến trình, bạn có thể throw lại
  }
}
ipcMain.handle("open-chrome-profile", async (_e, params) => {
  const { driverId } = await openChromeProfile(params);
  return driverId;
});

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
      chromeProfileIds: string[];
      comments: string;
      delay: number;
      linkLiveStream: string;
      acceptDupplicateComment: boolean;
    }
  ) => {
    const shuffled = shuffleArray(chromeProfileIds);

    const availableComments = new Set<string>(); // Sử dụng Set để kiểm tra comment đã gửi
    sendLogToRenderer(
      `🧮 Tổng cộng số lượng profile sẽ chạy seeding: ${shuffled.length} profile`
    );

    sendLogToRenderer(
      `🎯 Chế độ comment: ${
        acceptDupplicateComment
          ? "✅ Cho phép trùng"
          : "🚫 Không cho phép trùng"
      }`
    );
    for (const profileId of shuffled) {
      
    const commentList = comments
    .split(/[,\n]/)
    .map((c) => c.trim())
    .filter(Boolean);

  const comment =
    commentList.length > 0
      ? commentList[Math.floor(Math.random() * commentList.length)]
      : "Hello livestream 👋";
      // const profileName = path.basename(profilePath); // Lấy tên cuối cùng (ví dụ: "cuong guitar")

      const instance = browsers[profileId];

      if (!instance) continue;
      const profileName = path.basename(instance.profilePath);
      sendLogToRenderer(`👤 Bắt đầu chạy profile: ${profileName}`);

      // sendLogToRenderer(`Tổng cộng số lượng profile chạy luông seeding này ${shuffleArray.length} `);

      const { page } = instance;

      const url = page.url();
      sendLogToRenderer(`👤 URL: ${url}`);
      sendLogToRenderer(`👤 LINK LIVE: ${linkLiveStream}`);


      if (url !== linkLiveStream) {
        sendLogToRenderer(`👤 CO NHAY VAO : ${linkLiveStream}`);

        await page.goto(linkLiveStream, {
          waitUntil: "networkidle2",
          timeout: 0,
        });
      }

      if (availableComments.has(comment) && !acceptDupplicateComment) {
        sendLogToRenderer(`⚠️ Phát hiện comment trùng, bỏ qua!`);
        continue; // Bỏ qua nếu comment đã gửi và không cho phép trùng lặp
      }

      await enterTextIntoContentEditable(
        page,
        "div[contenteditable='plaintext-only']",
        comment
      );

      availableComments.add(comment); // Lưu comment vào Set

      // console.log(`⏳ Đợi ${delay}ms...`);
      // await new Promise((resolve) => setTimeout(resolve, delay)); // dùng delay từ props
      sendLogToRenderer(`----------------------------------`);
    }
    sendLogToRenderer(`----------------------------------`);
  }
);

ipcMain.handle("close-chrome-profile", async (_e, id: string) => {
  const instance = browsers[id];
  if (!instance) return false;
  await instance.browser.close();
  delete browsers[id];

  return false;
});

ipcMain.handle("delete-chrome-profile", (_e, profilePath: string) => {
  const profileName = path.basename(profilePath);
  if (fs.existsSync(profilePath)) {
    fs.rmSync(profilePath, { recursive: true, force: true });
    return true;
  }
  sendLogToRenderer(`Đã xóa profile : ${profileName} `);
  sendLogToRenderer(`----------------------------------`);

  return false;
});

ipcMain.handle("load-audio", async (_event, filePath: string) => {
  const audioBuffer = fs.readFileSync(filePath);
  const base64Audio = audioBuffer.toString("base64");
  const ext = path.extname(filePath).substring(1); // "mp3"
  const dataUrl = `data:audio/${ext};base64,${base64Audio}`;
  sendLogToRenderer(`Đã load audio ở đường dẫn ${filePath}`);
  sendLogToRenderer(`----------------------------------`);
  return dataUrl;
});

function findChromePath(): string | undefined {
  const platform = os.platform();

  if (platform === 'win32') {
    const chromePaths = [
      path.join(process.env['PROGRAMFILES'] || '', 'Google/Chrome/Application/chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google/Chrome/Application/chrome.exe'),
      path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
    ];
    return chromePaths.find(fs.existsSync);
  } else if (platform === 'darwin') {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return fs.existsSync(chromePath) ? chromePath : undefined;
  } else if (platform === 'linux') {
    const chromePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];
    return chromePaths.find(fs.existsSync);
  }
  return undefined;
}


ipcMain.handle(
  "create-chrome-profile",
  async (_e, { profileName, profilePath }) => {
    const fullProfilePath = path.join(profilePath, profileName);
    if (!fs.existsSync(fullProfilePath)) {
      fs.mkdirSync(fullProfilePath, { recursive: true });
    }

    let chromePath = findChromePath();
    if (!chromePath) {
      chromePath = puppeteer.executablePath();
    }
  
    if (!chromePath) {
      throw new Error('Không thể tìm thấy Chrome hoặc Chromium trên máy.');
    }
  

    const browser: Browser = await launch({
      headless: false,
      executablePath: chromePath,
      userDataDir: fullProfilePath,
      args: ["--no-first-run", "--no-default-browser-check"],
    });

    const page = await browser.newPage();
    await page.goto("https://example.com", {
      waitUntil: "networkidle2", // chờ đến khi không còn request mạng nào trong 500ms
    });

    await browser.close();
    sendLogToRenderer(`Đã tạo mới profile tại đường dẫn ${fullProfilePath}`);

    sendLogToRenderer(`----------------------------------`);
    return fullProfilePath;
  }
);

//CREATE LOG
function sendLogToRenderer(log: string) {
  const win = BrowserWindow.getAllWindows()[0]; // hoặc lưu biến win chính
  if (win) {
    win.webContents.send("update-log", log);
  }
}
app.on("before-quit", async (e) => {
  e.preventDefault();
  for (const id in browsers) {
    await browsers[id].browser.close();
  }
  app.quit();
});
