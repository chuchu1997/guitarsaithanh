// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { WebDriver } from "selenium-webdriver";
import { BaseSeeding, ProfileParams, SeedingCommentParams } from "./types";

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
  params:ProfileParams
  ): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
    console.log("CALL NE ",params);
    return await ipcRenderer.invoke("open-chrome-profile", params);
  },

  closeChrome: async (id: string): Promise<boolean> => {
    return await ipcRenderer.invoke("close-chrome-profile", id);
  },
 

  loadAudio: async (path: string): Promise<string> => {
    return await ipcRenderer.invoke("load-audio", path);
  },

  deleteChromeProfile: async (pathProfile: string): Promise<boolean> =>
    await ipcRenderer.invoke("delete-chrome-profile", pathProfile),
  // shareLiveStream: async (chromeIDS:string[],linkLive:string) => {
  //   console.log("SEND PRELOAD",chromeIDS)
  //   return await ipcRenderer.invoke("share-livestream",{chromeIDS,linkLive})
  //   // return await ipcRenderer.invoke("close-chrome-profile", id);
  // },
  seedingTiktokLiveStreamShare : async (params:BaseSeeding)=>{
    await ipcRenderer.invoke("seeding-share-livestream-tiktok",params)
  },
  seedingTiktokLiveStreamComments: async (params:SeedingCommentParams):Promise<void>=>{
    await ipcRenderer.invoke("seeding-comments-livestream-tiktok",params)
  },
  stopSeeding: async (): Promise<void> => {
    await ipcRenderer.invoke("stop-seeding");
  },
  
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
