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
  openChromeWithProfile: async (profilePath: string,proxyPath?:string,linkOpenChrome?:string): Promise<string> => {
    // Truyền tham số dưới dạng đối tượng
  
    return await ipcRenderer.invoke("open-chrome-profile", {  profilePath,proxyPath ,linkOpenChrome });
  },

  openMultipleProfilesWithLink: async (profiles: Array<{ profilePath: string, proxyPath?: string }>,linkSeeding:string): Promise<WebDriver[]> => {
    const drivers: WebDriver[] = []; // Lưu tất cả các driver

    const promises = profiles.map(async (profile) => {
      const driver = await ipcRenderer.invoke("open-chrome-profile", {  profilePath: profile.profilePath, proxyPath: profile.proxyPath ,linkOpenChrome:linkSeeding});
      drivers.push(driver);  // Lưu driver vào mảng
    });

    await Promise.all(promises); // Đảm bảo tất cả các promises đã hoàn thành trước khi trả về

    console.log('Đã mở tất cả các profile và lưu driver.');

    return drivers; // Trả về danh sách driver để có thể điều khiển sau
  },
  closeChrome: async (driver: WebDriver): Promise<void> => {
    await driver.quit()
    console.log('Đã đóng profile.');
  },

  deleteChromeProfile:async(pathProfile:string):Promise<boolean>=>
    await ipcRenderer.invoke("delete-chrome-profile",pathProfile)
};

contextBridge.exposeInMainWorld("backend", backend);