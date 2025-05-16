/** @format */

// main.ts
import { ipcMain, IpcMainInvokeEvent, app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

import puppeteer, { Browser, ElementHandle, Page } from "puppeteer-core";
import { createSeedingService } from "./services/social-seeding";
import { ProfileParams, SeedingCommentParams } from "src/electron/types";
import {
  closeBrowser,
  createChromeProfile,
  deleteProfile,
  getAllBrowserProfiles,
  openChromeProfile,
} from "./services/browser.service";
import { CommentParams, ShareParams } from "./services/social-seeding/base";
import { sendLogToRenderer } from "./utils/log.utils";

// IPC handlers
ipcMain.handle("open-chrome-profile", async (_e, params: ProfileParams) => {
  try {
    return await openChromeProfile(params);
  } catch (err) {
    return "";
  }
});

ipcMain.handle(
  "seeding-share-livestream-tiktok",
  async (_event: IpcMainInvokeEvent, params: ShareParams) => {
    try {
      const TiktokSeeding = createSeedingService("tiktok");
      await TiktokSeeding.shareContent(params);
    } catch (error) {
      sendLogToRenderer(
        `❌ Lỗi khi chạy seeding shares : ${(error as Error).message}`
      );
    }
  }
);

ipcMain.handle(
  "seeding-comments-livestream-tiktok",
  async (_event: IpcMainInvokeEvent, params: CommentParams) => {
    try {
      const TiktokSeeding = createSeedingService("tiktok");
      await TiktokSeeding.commentOnContent(params);
    } catch (error) {
      sendLogToRenderer(
        `❌ Lỗi khi chạy seeding comments : ${(error as Error).message}`
      );
    }
  }
);

ipcMain.handle("close-chrome-profile", async (_e, id: string) => {
  try {
    await closeBrowser(id);
  } catch (error) {
    sendLogToRenderer(`❌ Lỗi khi đóng profile : ${(error as Error).message}`);
  }
});

ipcMain.handle("delete-chrome-profile", (_e, profilePath: string) => {
  try {
    deleteProfile(profilePath);
  } catch (error) {
    sendLogToRenderer(`❌ Lỗi khi xóa profile : ${(error as Error).message}`);
  }
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
    try {
      return await createChromeProfile(profileName, profilePath);
    } catch (error) {
      sendLogToRenderer(`❌ Lỗi khi tạo profile : ${(error as Error).message}`);
    }
  }
);

// App lifecycle
app.on("before-quit", async (e) => {
  e.preventDefault();
  const browsers = getAllBrowserProfiles();
  for (const { browser } of Object.values(browsers)) {
    await browser.close(); // đảm bảo đóng xong từng browser
  }
  app.quit();
});
