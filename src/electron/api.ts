/** @format */

import { ipcMain, IpcMainInvokeEvent, app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";

import { Builder, By, WebDriver } from "selenium-webdriver";

import chrome from "selenium-webdriver/chrome";
import chromedriver from "chromedriver";

interface DriverWithProfile {
  driver: WebDriver; // WebDriver gốc
  profilePath: string; // Thông tin profilePath
}
const drivers: Record<string, DriverWithProfile> = {}; // Lưu driver với ID duy nhất

async function enterTextIntoContentEditable(
  driver: WebDriver,
  selector: string,
  text: string
) {
  try {
    // Find the comment input element
    console.log(`Looking for element with selector: ${selector}`);

    // Wait for the element to be present and clickable
    await driver.wait(
      async () => {
        try {
          const element = await driver.findElement(By.css(selector));
          return element !== null;
        } catch (e) {
          return false;
        }
      },
      10000,
      `Couldn't find element with selector: ${selector}`
    );

    const contentEditableDiv = await driver.findElement(By.css(selector));

    // Make sure the element is in view
    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      contentEditableDiv
    );

    // Click to ensure focus
    await contentEditableDiv.click();
    await driver.sleep(1000); // Give time for any animations or focus events

    // Try multiple methods to input text
    try {
      // Method 1: Using sendKeys
      await contentEditableDiv.sendKeys(text);
      await driver.sleep(1000);
    } catch (e) {
      console.log("Standard sendKeys failed, trying JavaScript method");

      // Method 2: Using JavaScript to set content and dispatch events
      await driver.executeScript(
        `
        arguments[0].textContent = '${text}';
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
      `,
        contentEditableDiv
      );
    }

    // Wait a moment for the text to register
    await driver.sleep(500);

    // Look for and click the post button instead of pressing Enter
    console.log("Looking for post button...");
    const postButtonSelector = "div[data-e2e='comment-post']";

    await driver.wait(
      async () => {
        try {
          const element = await driver.findElement(By.css(postButtonSelector));
          return element !== null;
        } catch (e) {
          return false;
        }
      },
      5000,
      "Couldn't find comment post button"
    );

    const postButton = await driver.findElement(By.css(postButtonSelector));

    // Make sure the button is in view
    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      postButton
    );

    // Click the button
    console.log("Clicking post button...");
    await postButton.click();

    console.log("Comment successfully posted!");
  } catch (error) {
    console.error(
      "Error when entering text into contentEditable element:",
      error
    );
    throw error; // Re-throw to handle in the calling function
  }
}
function getRandomUserAgent(): string {
  const osList = [
    "Windows NT 10.0; Win64; x64",
    "Windows NT 6.1; Win64; x64",
    "Macintosh; Intel Mac OS X 10_15_7",
    "X11; Linux x86_64",
  ];

  const chromeMajor = Math.floor(Math.random() * 20) + 100; // Chrome 100 - 119
  const chromeMinor = Math.floor(Math.random() * 5000) + 1000;
  const chromeBuild = Math.floor(Math.random() * 100) + 0;

  const os = osList[Math.floor(Math.random() * osList.length)];

  return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMajor}.0.${chromeMinor}.${chromeBuild} Safari/537.36`;
}
function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array]; // Tạo bản sao của mảng để tránh thay đổi mảng gốc
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Đổi chỗ các phần tử
  }
  return shuffledArray;
}
async function openChromeProfile({
  id,
  profilePath,
  proxyPath,
  linkOpenChrome,
  totalProfile,
}: {
  id: string;
  profilePath: string;
  proxyPath?: string;
  linkOpenChrome?: string;
  totalProfile?: number;
}): Promise<{ driverId: string }> {
  const screenWidth = 1920; // hoặc dùng electron / API để lấy màn hình thực tế
  const screenHeight = 1080;
  if (!fs.existsSync(profilePath)) {
    throw new Error("Profile không tồn tại.");
  }
  const options = new chrome.Options();
  options.addArguments(`--user-data-dir=${profilePath}`);
  options.addArguments("--no-first-run");
  options.addArguments("--no-default-browser-check");
  options.addArguments("--disable-gpu");
  options.addArguments("--disable-software-rasterizer");
  // 👇 Thêm các flags để giảm khả năng bị TikTok phát hiện là bot
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-infobars");
  options.addArguments("--disable-extensions");
  options.addArguments("--start-maximized");

  // 👇 User agent như người thật
  const userAgentPath = path.join(profilePath, "ua.txt");
  let userAgent: string;

  if (fs.existsSync(userAgentPath)) {
    userAgent = fs.readFileSync(userAgentPath, "utf-8").trim();
  } else {
    userAgent = getRandomUserAgent();
    fs.writeFileSync(userAgentPath, userAgent, "utf-8");
  }
  console.log("PROXY PATH", proxyPath);
  if (proxyPath) {
    options.addArguments(`--proxy-server=${proxyPath}`);
  }
  // 👉 Tính toán lưới layout

  const total = totalProfile;

  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const width = Math.floor(screenWidth / cols);
  const height = Math.floor(screenHeight / rows);

  const index = Object.keys(drivers).length; // Tính chỉ số cửa sổ mới đang được mở
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * width;
  const y = row * height;

  options.addArguments(`--window-size=${width},${height}`);
  options.addArguments(`--window-position=${x},${y}`);

  const service = new chrome.ServiceBuilder(chromedriver.path);
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeService(service)
    .setChromeOptions(options)
    .build();

  await driver.get(linkOpenChrome || "https://www.tiktok.com/");
  // const { driverId } = await openChromeProfile(profile);
  // driverIds.push(driverId);
  drivers[id] = { driver, profilePath }; // Hoặc profileName nếu bạn dùng theo tên

  return { driverId: id };
}

ipcMain.handle(
  "node-version",
  (event: IpcMainInvokeEvent, msg: string): string => {
    console.log(event);
    console.log(msg);
    return process.versions.node;
  }
);

// Hàm Fisher-Yates Shuffle để trộn ngẫu nhiên mảng

ipcMain.handle(
  "seeding-livestream",
  async (
    _event: IpcMainInvokeEvent,
    {
      chromeProfileIds,
      comments,
      delay,
      linkLiveStream,
    }: {
      chromeProfileIds: string[];
      comments: string;
      delay: number;
      linkLiveStream: string;
    }
  ): Promise<void> => {
    console.log("⏩ Bắt đầu seeding livestream...");
    console.log("Profiles:", chromeProfileIds);
    console.log("Comments:", comments);
    console.log("Delay:", delay);
    console.log("Livestream Link:", linkLiveStream);
    const shuffledProfileIds = shuffleArray(chromeProfileIds);
    //RANDOM THỨ TỰ SHUFFED PROFILE IDS

    for (const profileId of shuffledProfileIds) {
      const driverWithProfile = drivers[profileId];
      if (driverWithProfile) {
        const { driver } = driverWithProfile;
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl !== linkLiveStream) {
          await driver.get(linkLiveStream);
        }
        // Thực hiện seeding comment
        // Thêm logic để điền comment vào livestream (có thể là thao tác trên DOM, giả sử comment được gửi vào một form nào đó)
        // Ví dụ (cần tùy chỉnh theo DOM của trang thực tế):
        // await driver.findElement(By.id('commentInput')).sendKeys(comments);

        // Chờ 1 khoảng thời gian (delay)
        const commentList = comments
          .split(/[,\n]/)
          .map((c) => c.trim())
          .filter((c) => c);

        const commentToPost =
          commentList.length > 0
            ? commentList[Math.floor(Math.random() * commentList.length)]
            : "Hello a";

        await enterTextIntoContentEditable(
          driver,
          "div[contenteditable='plaintext-only'][placeholder='Say something nice']",
          commentToPost
        );
        await driver.sleep(delay);
        console.log(`Đợi ${delay}ms trước khi gửi comment...`);
        // Thực hiện gửi comment (giả sử có button gửi)
        // await driver.findElement(By.id('submitButton')).click();

        console.log(`Seeding livestream cho profile ${profileId} hoàn tất!`);
      } else {
        console.log(`Không tìm thấy driver cho profile ${profileId}`);
      }
    }

    // TODO: Thực hiện seeding tại đây
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

ipcMain.handle(
  "open-chrome-profile",
  async (
    event: IpcMainInvokeEvent,
    {
      id,
      profilePath,
      proxyPath,
      linkOpenChrome,
      totalProfile,
    }: {
      id: string;
      profilePath: string;
      profileName: string;
      proxyPath?: string;
      linkOpenChrome?: string;
      totalProfile?: number;
    }
  ): Promise<string> => {
    const { driverId } = await openChromeProfile({
      id,
      profilePath,
      proxyPath,
      linkOpenChrome,
      totalProfile,
    });
    return driverId;
  }
);

ipcMain.handle(
  "create-chrome-profile",
  async (
    event: IpcMainInvokeEvent,
    { profileName, profilePath }: { profileName: string; profilePath: string }
  ): Promise<string> => {
    const fullProfilePath = path.join(profilePath, profileName);
    try {
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(fullProfilePath)) {
        fs.mkdirSync(fullProfilePath, { recursive: true });
      }
      // Cấu hình Chrome Options
      const options = new chrome.Options();
      options.addArguments("--headless=new"); // Dùng `new` để hỗ trợ lưu profile

      options.addArguments(`--user-data-dir=${fullProfilePath}`);
      options.addArguments("--no-first-run");
      options.addArguments("--no-default-browser-check");
      options.addArguments("--start-maximized");
      options.addArguments("--disable-gpu");
      options.addArguments("--disable-software-rasterizer");

      // Khởi tạo ChromeDriver
      const service = new chrome.ServiceBuilder(chromedriver.path);
      const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeService(service)
        .setChromeOptions(options)
        .build();

      // Mở trang test và chờ vài giây để Chrome ghi dữ liệu profile

      // await driver.sleep(3000); // Có thể điều chỉnh

      await driver.quit(); // Quan trọng để đảm bảo profile được lưu

      return fullProfilePath;
    } catch (err) {
      console.error("Lỗi khi mở Chrome:", err);
      throw new Error("Không thể tạo hoặc mở profile Chrome.");
    }
  }
);

let isQuitting = false; // Cờ kiểm tra nếu app đã đang thoát
app.on("before-quit", async (event) => {
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
