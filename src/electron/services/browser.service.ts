/** @format */

import puppeteer, { Browser, Page } from "puppeteer-core";
import fs from "fs";
import path from "path";
import { BrowserProfile, ProfileParams } from "../types";
import {
  cleanLockFiles,
  findChromePath,
  findEdgePath,
  getRandomUserAgent,
} from "../utils/system.utils";
import {
  sendCloseNotificationToRenderer,
  sendLogToRenderer,
} from "../utils/log.utils";

// Constants
const DEFAULT_TIMEOUT = 40000; // 30 seconds

// Store browser instances
const browsers: Record<string, BrowserProfile> = {};

/**
 * Close browser and cleanup resources
 */
export async function closeBrowser(driverId: string): Promise<void> {
  const instance = browsers[driverId];
  if (!instance) return;
  await instance.browser.close();
  delete browsers[driverId];
  sendCloseNotificationToRenderer(driverId);
}

/**
 * Check if page has CAPTCHA
 */
export async function detectCaptcha(page: Page): Promise<boolean> {
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

/**
 * Open Chrome with specified profile
 */
export async function openChromeProfile({
  id,
  profilePath,
  proxy,
  // totalProfile = 1,
  headless = false,
  link = "https://tiktok.com",
}: ProfileParams): Promise<string> {
  const profileName = path.basename(profilePath);
  try {
    // Clean lock files that might prevent browser from opening
    cleanLockFiles(profilePath);

    // Calculate window position and size
    const screenWidth = 1920;
    const screenHeight = 1080;
    // const cols = Math.ceil(Math.sqrt(totalProfile));
    // const rows = Math.ceil(totalProfile / cols);
    // const width = Math.floor(screenWidth / cols);
    // const height = Math.floor(screenHeight / rows);

    // const index = Object.keys(browsers).length;
    // const row = Math.floor(index / cols);
    // const col = index % cols;
    // const x = col * width;
    // const y = row * height;

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
      "--window-size=1280,800",
    ];
    // `--window-position=${x},${y}`,

    //CHẠY Ở CHẾ ĐỘ KHÔNG GIAO DIỆN
    // if (!headless) {
    //   args.push(`--window-size=${width},${height}`);
    // } else {
    //   args.push("--window-size=1280,800");
    // }

    // Setup proxy if needed
    if (headless) {
      args.push(`--disable-gpu`);
      args.push(`--no-sandbox`);
    }
    if (proxy) {
      const proxyParts = proxy.split(":");
      args.push(`--proxy-server=http://${proxyParts[0]}:${proxyParts[1]}`);
    }

    sendLogToRenderer(`🖥️ Headless: ${headless ? "Có" : "Không"}`);

    // Find Chrome executable
    // const chromePath =
    //   findEdgePath() || findChromePath() || puppeteer.executablePath();
    // sendLogToRenderer(`🖥️ Đường dẫn chrome Exe: ${chromePath}`);

    // Launch browser
    const edgePath = findEdgePath() || puppeteer.executablePath();

    const browser = await puppeteer.launch({
      headless,
      executablePath: edgePath,
      args,
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      },
    });
    //GÁN TẠM ĐỂ NẾU CÓ LỖI THÌ XỬ LÝ LIỀN
    browsers[id] = { browser, page: null as any, profilePath }; // Gán tạm

    // Handle browser disconnection
    browser.on("disconnected", async () => {
      sendLogToRenderer(`❌ Browser với profile ${profileName} đã đóng.`);
      await closeBrowser(id);
    });

    // Get or create page
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());
    await page.setUserAgent(userAgent);

    // Authenticate with proxy if credentials provided
    if (proxy) {
      const [ip, port, username, password] = proxy.split(":");
      try {
        await page.authenticate({ username, password });
      } catch (err) {
        sendLogToRenderer(
          `❌ Proxy chêt !!!! ${profileName}, bỏ qua profile này.`
        );
        throw err;
      }
    }

    // Navigate to TikTok

    await page.goto(link, { timeout: DEFAULT_TIMEOUT });

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
    browsers[id].page = page;

    sendLogToRenderer(`✅ Đã mở profile : ${profileName}`);
    sendLogToRenderer(`--------------------------------`);

    return id;
  } catch (err) {
    await closeBrowser(id);
    sendLogToRenderer(
      `❌ Lỗi mở profile ${profileName} với ID: ${id} : ${
        (err as Error).message
      }`
    );
    return "";
  }
}

/**
 * Create a new Chrome profile
 */
export async function createChromeProfile(
  profileName: string,
  profilePath: string
): Promise<string> {
  const fullProfilePath = path.join(profilePath, profileName);

  // Create profile directory if it doesn't exist
  if (!fs.existsSync(fullProfilePath)) {
    fs.mkdirSync(fullProfilePath, { recursive: true });
  }

  // Find Chrome path
  const edgePath = findEdgePath() || puppeteer.executablePath();
  if (!edgePath) {
    throw new Error("Không thể tìm thấy Chrome hoặc Chromium trên máy.");
  }

  // Initialize the profile
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: edgePath,
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

/**
 * Delete a Chrome profile
 */
export function deleteProfile(profilePath: string): boolean {
  const profileName = path.basename(profilePath);

  if (fs.existsSync(profilePath)) {
    fs.rmSync(profilePath, { recursive: true, force: true });
    sendLogToRenderer(`Đã xóa profile : ${profileName} `);
    sendLogToRenderer(`----------------------------------`);
    return true;
  }

  return false;
}

/**
 * Get browser profile by ID
 */
export function getBrowserProfile(id: string): BrowserProfile | undefined {
  return browsers[id];
}

/**
 * Get all browser profiles
 */
export function getAllBrowserProfiles(): Record<string, BrowserProfile> {
  return browsers;
}
