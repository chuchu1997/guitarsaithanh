// main.ts
import { ipcMain, IpcMainInvokeEvent, app } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import { Buffer } from "buffer";
import puppeteer, { Browser, Page, launch } from "puppeteer-core";
import chromeLauncher from "chrome-launcher";
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
}: {
  id: string;
  profilePath: string;
  proxyPath?: string;
  linkOpenChrome?: string;
  totalProfile?: number;
}): Promise<{ driverId: string } | null> {
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
    let userAgent = fs.existsSync(userAgentPath)
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
      `--window-size=${width},${height}`,
      `--window-position=${x},${y}`,
    ];

    if (proxyPath) {
      const [ip, port] = proxyPath.split(":");
      args.push(`--proxy-server=http://${ip}:${port}`);
    }

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: CHROME_PATH,
      args,
      defaultViewport: null,
    });

    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());

    await page.setUserAgent(userAgent);

    if (proxyPath) {
      const [, , username, password] = proxyPath.split(":");
      await page.authenticate({ username, password });
    }

    await page.goto("https://tiktok.com", {
      waitUntil: "load",
      timeout: 30000, // nếu quá 30s thì bỏ qua
    });

    browsers[id] = { browser, page, profilePath };
    return { driverId: id };
  } catch (err) {
    console.error(`❌ Lỗi mở profile ${id}:`, (err as Error).message);
    return null;
  }
}

async function enterTextIntoContentEditable(
  page: Page,
  selector: string,
  text: string
) {
  await page.waitForSelector(selector, { timeout: 10000 });
  const el = await page.$(selector);
  if (!el) throw new Error("Không tìm thấy input");

  await el.click();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await el.type(text);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const postBtnSelector = "div[data-e2e='comment-post']";
  await page.waitForSelector(postBtnSelector, { timeout: 5000 });
  const postBtn = await page.$(postBtnSelector);
  if (!postBtn) throw new Error("Không tìm thấy nút post");
  await postBtn.click();

  console.log("✅ Comment đã gửi!");
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
    }: {
      chromeProfileIds: string[];
      comments: string;
      delay: number;
      linkLiveStream: string;
    }
  ) => {
    const shuffled = shuffleArray(chromeProfileIds);
    for (const profileId of shuffled) {
      const instance = browsers[profileId];
      if (!instance) continue;

      const { page } = instance;

      const url = page.url();
      if (url !== linkLiveStream) {
        await page.goto(linkLiveStream);
      }

      const commentList = comments
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);

      const comment =
        commentList.length > 0
          ? commentList[Math.floor(Math.random() * commentList.length)]
          : "Hello livestream 👋";

      await enterTextIntoContentEditable(
        page,
        "div[contenteditable='plaintext-only'][placeholder='Say something nice']",
        comment
      );

      console.log(`⏳ Đợi ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
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
  console.log("PROFILE", profilePath);
  if (fs.existsSync(profilePath)) {
    fs.rmSync(profilePath, { recursive: true, force: true });
    return true;
  }
  return false;
});

ipcMain.handle(
  "create-chrome-profile",
  async (_e, { profileName, profilePath }) => {
    const fullProfilePath = path.join(profilePath, profileName);
    if (!fs.existsSync(fullProfilePath)) {
      fs.mkdirSync(fullProfilePath, { recursive: true });
    }
    const chromePath = chromeLauncher.Launcher.getInstallations().find((p) =>
      p.toLowerCase().includes("chrome")
    );
    const browser: Browser = await launch({
      headless: false,
      executablePath: chromePath,
      userDataDir: fullProfilePath,
      args: ["--no-first-run", "--no-default-browser-check"],
    });

    const page = await browser.newPage();
    await page.goto("https://example.com");
    await new Promise((r) => setTimeout(r, 3000)); // Đợi Chrome ghi dữ liệu profile
    await browser.close();

    return fullProfilePath;
  }
);

app.on("before-quit", async (e) => {
  e.preventDefault();
  for (const id in browsers) {
    await browsers[id].browser.close();
  }
  app.quit();
});
