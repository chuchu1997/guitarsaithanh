import fs from "fs";
import path from "path";
import os from "os";

import { sendLogToRenderer } from "./log.utils"

/**
 * Find Chrome executable path based on operating system
 */
export function findChromePath(): string | undefined {
  const platform = os.platform();

  if (platform === "win32") {
    const chromePaths = [
      path.join(process.env["PROGRAMFILES"] || "", "Google/Chrome/Application/chrome.exe"),
      path.join(process.env["PROGRAMFILES(X86)"] || "", "Google/Chrome/Application/chrome.exe"),
      path.join(process.env["LOCALAPPDATA"] || "", "Google/Chrome/Application/chrome.exe"),
    ];
    return chromePaths.find(fs.existsSync);
  } else if (platform === "darwin") {
    const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
export function findEdgePath():string | undefined { 
  const edgePaths = [
    // Đường dẫn trên Windows
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    // Đường dẫn trên MacOS
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Đường dẫn trên Linux
    "/usr/bin/microsoft-edge",
    "/usr/local/bin/microsoft-edge",
  ];

  for (const path of edgePaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return null;
}

/**
 * Clean lock files that might prevent browser from opening
 */
export function cleanLockFiles(profilePath: string): void {
  const lockFiles = ["LOCK", "lockfile", "SingletonLock", "SingletonCookie"];
  for (const file of lockFiles) {
    const lockFilePath = path.join(profilePath, file);
    if (fs.existsSync(lockFilePath)) {
      sendLogToRenderer(`✅ Phát hiện có LOCK file ở path ${profilePath}.`);
      try {
        fs.unlinkSync(lockFilePath);
        sendLogToRenderer(`🗑️ Đã xóa file khóa: ${lockFilePath}`);
      } catch (err) {
        sendLogToRenderer(`⚠️ Không thể xóa file khóa: ${(err as Error).message}`);
      }
    }
  }
}

/**
 * Generate a random user agent string
 */
export function getRandomUserAgent(): string {
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

/**
 * Shuffle array elements randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}