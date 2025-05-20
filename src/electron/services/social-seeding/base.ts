/** @format */

import { Page } from "puppeteer-core";
import { sendLogToRenderer } from "../../utils/log.utils";
import path from "path";
import {
  closeBrowser,
  detectCaptcha,
  getBrowserProfile,
} from "../browser.service";
import { SeedingCommentParams, ShareParams } from "src/electron/types";

/// SETTING CHỜ MỞ CŨNG NHƯ THAO TÁC CHO PUPPER VỚI PAGE !!!
export const COMMON_CONSTANTS = {
  MAX_CONCURRENCY: 3,
  DEFAULT_TIMEOUT_MS: 6000,
  NAVIGATION_TIMEOUT_MS: 30000,
};

// export type ShareParams = BaseParams;

export abstract class SocialSeeding {
  /**
   * Process profiles in batches with controlled concurrency
   */
  //Giống như tạo thread ví dụ BatchSize = 3 và list có 10 thì chia ra (1,2,3) (4,5,6) (7,8,9) (1)
  protected createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  //Điều khiển page đi đến đường dẫn nếu như đường dẫn hiện tại khác với đường dẫn được người dùng truyền vào !!!
  protected async navigateIfNeeded(
    page: Page,
    targetUrl: string
  ): Promise<void> {
    console.log("PAGE URL", page.url());
    console.log("TARGET URL", targetUrl);

    if (page.url() !== targetUrl) {
      sendLogToRenderer(`🔁 Đang đi đến đường dẫn : ${targetUrl}`);
      await page.goto(targetUrl, {
        waitUntil: "networkidle2",
        timeout: COMMON_CONSTANTS.NAVIGATION_TIMEOUT_MS,
      });
    }
  }
  //Get Profile Name
  protected getProfileNameFromPath(profilePath: string): string {
    return path.basename(profilePath);
  }

  /**
   * Process a profile with error handling
   */
  protected async processProfile<T>(
    chromeId: string,
    operation: (page: Page, profileName: string) => Promise<T>
  ): Promise<T | null> {
    const instance = getBrowserProfile(chromeId);
    if (!instance) {
      sendLogToRenderer(`⚠️ Instance not found for profile: ${chromeId}`);
      return null;
    }
    const { page, profilePath } = instance;
    const profileName = this.getProfileNameFromPath(profilePath);

    try {
      // Check for CAPTCHA
      if (await detectCaptcha(page)) {
        sendLogToRenderer(
          `❌ Phát hiện Capcha ở profile ${profileName}, (bỏ qua )`
        );
        await closeBrowser(chromeId);
        return null;
      }

      return await operation(page, profileName);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await closeBrowser(chromeId);
      sendLogToRenderer(`❌ Lỗi ở Profile  ${profileName}: ${errorMessage}`);
      return null;
    }
  }

  abstract shareContent(params: ShareParams): Promise<void>;

  abstract commentOnContent(params: SeedingCommentParams): Promise<void>;
}
