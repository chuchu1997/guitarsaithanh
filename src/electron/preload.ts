// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { WebDriver } from "selenium-webdriver";

export const backend = {
  nodeVersion: async (msg: string): Promise<string> =>
    await ipcRenderer.invoke("node-version", msg),
  createChromeProfile: async (profileName: string, profilePath: string): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
    return await ipcRenderer.invoke("create-chrome-profile", { profileName, profilePath });
  },
  openChromeWithProfile: async (id:string,profilePath: string,proxyPath?:string,linkOpenChrome?:string): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
  
    return await ipcRenderer.invoke("open-chrome-profile", {id:id,  profilePath,proxyPath ,linkOpenChrome });
  },

  openMultipleProfilesWithLink: async (profiles: Array<{ id:string,profilePath: string, proxyPath?: string }>): Promise<string[]> => {
  return  await ipcRenderer.invoke("open-chrome-multiple-profile",{profiles})
  
    // await ipcRenderer.invoke("open-chrome-multiple-profile", {  profilePath: profile.profilePath, proxyPath: profile.proxyPath });
  },
  closeChrome: async (id:string): Promise<boolean> => {
   return await ipcRenderer.invoke("close-chrome-profile",id)
  },

  deleteChromeProfile:async(pathProfile:string):Promise<boolean>=>
    await ipcRenderer.invoke("delete-chrome-profile",pathProfile)
};

contextBridge.exposeInMainWorld("backend", backend);