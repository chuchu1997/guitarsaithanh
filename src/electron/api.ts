import { ipcMain, IpcMainInvokeEvent ,app,BrowserWindow} from "electron";
import path from "path";
import fs from "fs";

import { Builder, WebDriver} from 'selenium-webdriver';


import chrome from "selenium-webdriver/chrome";
import chromedriver from "chromedriver";

interface DriverWithProfile {
  driver: WebDriver;  // WebDriver gốc
  profilePath: string;  // Thông tin profilePath
}
const drivers: Record<string, DriverWithProfile> = {}; // Lưu driver với ID duy nhất

async function openChromeProfile({
  id,
  profilePath,
  proxyPath,
  linkOpenChrome
}: {
  id:string,
  profilePath: string;
  proxyPath?: string;
  linkOpenChrome?: string;
}): Promise<{ driverId: string }> {
  if (!fs.existsSync(profilePath)) {
    throw new Error("Profile không tồn tại.");
  }


  const options = new chrome.Options();
  options.addArguments(`--user-data-dir=${profilePath}`);
  options.addArguments('--no-first-run');
  options.addArguments('--no-default-browser-check');
  options.addArguments('--start-maximized');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-software-rasterizer');

  if (proxyPath) {
    options.addArguments(`--proxy-server=${proxyPath}`);
  }

  const service = new chrome.ServiceBuilder(chromedriver.path);
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(service)
    .setChromeOptions(options)
    .build();

  await driver.get(linkOpenChrome || 'https://google.com');


  drivers[id] = { driver, profilePath }; // Hoặc profileName nếu bạn dùng theo tên

  return { driverId:id };
}

ipcMain.on('before-quit',async()=>{
  console.log("DO SOMETHING !!");
  
})

ipcMain.handle(
  "node-version",
  (event: IpcMainInvokeEvent, msg: string): string => {
    console.log(event);
    console.log(msg);
    return process.versions.node;
  }
);
ipcMain.handle(
  "close-chrome-profile",
 async (event: IpcMainInvokeEvent, id: string): Promise<boolean> => {
    const target = drivers[id];
    if (!target) {
      console.warn(`Không tìm thấy driver với ID: ${id}`);
      return true;
    }

    try {
      console.log("TIM THAY TARGET",target)
      await target.driver.quit(); // Đóng trình duyệt
      delete drivers[id]; // Xoá khỏi danh sách
      console.log(`Đã đóng Chrome profile với ID: ${id}`);
      return false;
    } catch (err) {
      console.error(`Lỗi khi đóng Chrome profile ${id}:`, err);
      return true;
    }
  }
);

ipcMain.handle(
  "delete-chrome-profile",
  (event: IpcMainInvokeEvent, pathProfile: string): boolean => {
    try {
      if (fs.existsSync(pathProfile)) {
        fs.rmSync(pathProfile, { recursive: true, force: true });
        console.log(`Đã xoá profile tại: ${pathProfile}`);
      } else {
        console.warn(`Không tìm thấy thư mục: ${pathProfile}`);
      }
      return true;
    } catch (error) {
      console.error("Lỗi khi xoá profile Chrome:", error);
      return false;
    }
  }
);

ipcMain.handle('open-chrome-multiple-profile', async (event, profiles: Array<{ id:string,profilePath: string, proxyPath?: string }>): Promise<string[]> => {
  const driverIds: string[] = [];

  const promises = profiles.map(async (profile) => {
    try {
      const { driverId } = await openChromeProfile(profile);
      driverIds.push(driverId);
    } catch (error) {
      console.error("Error khi mở profile:", profile.profilePath, error);
    }
  });

  await Promise.all(promises);
  return driverIds;
});


ipcMain.handle('open-chrome-profile', async (event: IpcMainInvokeEvent, {id, profilePath, proxyPath,linkOpenChrome }: {id:string, profilePath: string, profileName: string, proxyPath?: string ,linkOpenChrome?:string}):Promise<string> => {
  const { driverId } = await openChromeProfile({id, profilePath, proxyPath, linkOpenChrome });
  return driverId;
});

ipcMain.handle(
  'create-chrome-profile',
  async (
    event: IpcMainInvokeEvent,
    {
      profileName,
      profilePath,
    }: { profileName: string; profilePath: string }
  ): Promise<string> => {
    const fullProfilePath = path.join(profilePath, profileName);
    try {
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(fullProfilePath)) {
        fs.mkdirSync(fullProfilePath, { recursive: true });
      }
      // Cấu hình Chrome Options
      const options = new chrome.Options();
      options.addArguments('--headless=new'); // Dùng `new` để hỗ trợ lưu profile

      options.addArguments(`--user-data-dir=${fullProfilePath}`);
      options.addArguments('--no-first-run');
      options.addArguments('--no-default-browser-check');
      options.addArguments('--start-maximized');
      options.addArguments('--disable-gpu');
      options.addArguments('--disable-software-rasterizer');

      // Khởi tạo ChromeDriver
      const service = new chrome.ServiceBuilder(chromedriver.path);
      const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeService(service)
        .setChromeOptions(options)
        .build();

      // Mở trang test và chờ vài giây để Chrome ghi dữ liệu profile

      // await driver.sleep(3000); // Có thể điều chỉnh

      await driver.quit(); // Quan trọng để đảm bảo profile được lưu

      return fullProfilePath;
    } catch (err) {
      console.error('Lỗi khi mở Chrome:', err);
      throw new Error('Không thể tạo hoặc mở profile Chrome.');
    }
  }
);


let isQuitting = false; // Cờ kiểm tra nếu app đã đang thoát
app.on('before-quit', async (event) => {
  if (isQuitting) return;
  isQuitting = true; // Đánh dấu là ứng dụng đang thoát
  event.preventDefault();

  for (const driverId in drivers) {
    const target = drivers[driverId];
    await target.driver.quit();
    delete drivers[driverId]; // Xoá khỏi danh sách
  
  }
  app.quit();
});


