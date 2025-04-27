// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { WebDriver } from "selenium-webdriver";

export const backend = {
  nodeVersion: async (msg: string): Promise<string> =>
    await ipcRenderer.invoke("node-version", msg),
  createChromeProfile: async (
    profileName: string,
    profilePath: string
  ): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
    return await ipcRenderer.invoke("create-chrome-profile", {
      profileName,
      profilePath,
    });
  },
  openChromeWithProfile: async (
    id: string,
    profilePath: string,
    proxyPath?: string,
    linkOpenChrome?: string,
    totalProfile?: number,
    headless?: boolean
  ): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
    return await ipcRenderer.invoke("open-chrome-profile", {
      id: id,
      profilePath,
      proxyPath,
      linkOpenChrome,
      totalProfile,
      headless,
    });
  },

  closeChrome: async (id: string): Promise<boolean> => {
    return await ipcRenderer.invoke("close-chrome-profile", id);
  },

  loadAudio: async (path: string): Promise<string> => {
    return await ipcRenderer.invoke("load-audio", path);
  },

  deleteChromeProfile: async (pathProfile: string): Promise<boolean> =>
    await ipcRenderer.invoke("delete-chrome-profile", pathProfile),

  seedingLiveStream: async (
    chromeProfileIds: string[],
    comments: string,
    delay: number,
    linkLiveStream: string,
    acceptDupplicateComment: boolean
  ): Promise<void> =>
    await ipcRenderer.invoke("seeding-livestream", {
      chromeProfileIds,
      comments,
      delay,
      linkLiveStream,
      acceptDupplicateComment,
    }),

  onLogUpdate: (callback: (log: string) => void): void => {
    ipcRenderer.on("update-log", (_event, log) => {
      callback(log);
    });
  },

  onListenCloseChromeByUser: (
    callback: (driverIdClose: string) => void
  ): void => {
    ipcRenderer.on("close-chrome-manual", (_event, driverIdClose) => {
      callback(driverIdClose);
    });
  },
};

contextBridge.exposeInMainWorld("backend", backend);
