// src/utils/log-utils.ts
import { BrowserWindow } from "electron";

/**
 * Send log message to renderer process
 */
export function sendLogToRenderer(log: string): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("update-log", log);
  }
}

/**
 * Send notification to renderer about chrome manual closure
 */
export function sendCloseNotificationToRenderer(browserId: string): void {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("close-chrome-manual", browserId);
  }
}