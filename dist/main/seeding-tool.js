"use strict";
const electron = require("electron");
const path$1 = require("node:path");
const path = require("path");
electron.ipcMain.handle(
  "node-version",
  (event, msg) => {
    console.log(event);
    console.log(msg);
    return process.versions.node;
  }
);
electron.ipcMain.handle(
  "create-chrome-profile",
  async (event, { profileName, profilePath }) => {
    try {
      const fullProfilePath = path.join(profilePath, profileName);
      return Promise.resolve(fullProfilePath);
    } catch (err) {
      console.error("Lỗi khi mở Chrome:", err);
      throw new Error("Không thể tạo hoặc mở profile Chrome.");
    }
  }
);
const { Builder } = (() => {
  const mod = require("selenium-webdriver");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const createWindow = async () => {
  const mainWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js")
    }
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.get("https://google.com");
};
electron.app.on("ready", createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
