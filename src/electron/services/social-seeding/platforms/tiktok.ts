/** @format */

import { Page, ElementHandle } from "puppeteer-core";
import { sendLogToRenderer } from "../../../utils/log.utils";
import { shuffleArray } from "../../../utils/system.utils";
import {
  SocialSeeding,
  ShareParams,
  CommentParams,
  COMMON_CONSTANTS,
} from "../base";
import { closeBrowser } from "../../browser.service";

const TIKTOK_CONSTANTS = {
  //TEXT MẶC ĐỊNH LIVESTREAM
  DEFAULT_COMMENT: "Hello livestream 👋",
  //THẺ INPUT DÙNG ĐỂ NHẬP NỘI DUNG SEEDING
  COMMENT_SELECTOR: "div[contenteditable='plaintext-only']",

  //NÚT SHARE
  SHARE_ICON_SELECTOR: 'i[data-e2e="share-icon"]',
  //CLICK VÀO NÚT SHARE Ở PHẦN DROPDOWN SAU KHI HOVER !!!
  SHARE_LINK_SELECTOR: 'a[data-e2e="share-link"][href="#"]',

  //NÚT COMMENTS Ở LIVESTREAM
  POST_BUTTON_SVG_PATH: 'svg path[d^="M45.7321 7.00001"]',
};

export class TiktokSeeding extends SocialSeeding {
  /**
   * Enter text into TikTok's comment box and submit
   */

  /**
   * Kiểm tra trạng thái dừng
   */

  private async excuteShare(page: Page): Promise<void> {
    try {
      //ĐỢI NÚT SHARE XUẤT HIỆN
      await page.waitForSelector(TIKTOK_CONSTANTS.SHARE_ICON_SELECTOR, {
        visible: true,
        timeout: COMMON_CONSTANTS.DEFAULT_TIMEOUT_MS,
      });

      //ĐỢI NÚT SHARE XUẤT HIỆN SAU ĐÓ HOVER
      await page.hover(TIKTOK_CONSTANTS.SHARE_ICON_SELECTOR);

      // SAU KHI HOVER XONG THÌ TÌM KIẾM TRONG DROPDOWN NÚT SHARE NHẤN VÀO
      await page.waitForSelector(TIKTOK_CONSTANTS.SHARE_LINK_SELECTOR, {
        visible: true,
        timeout: 3000,
      });

      await page.click(TIKTOK_CONSTANTS.SHARE_LINK_SELECTOR);
      // SAU KHI SHARE XONG MOVE CURSOR RA NGOÀI ĐỂ TẮT DROPDOWN HOVER !!1

      await page.mouse.move(0, 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendLogToRenderer(`❌ Share Action Error !!: ${message}`);

      throw error;
    }
  }

  private async enterCommentAndSubmit(
    page: Page,
    text: string,
    profileName: string,
    timeoutMS = COMMON_CONSTANTS.DEFAULT_TIMEOUT_MS
  ): Promise<void> {
    try {
      await page.waitForSelector(TIKTOK_CONSTANTS.COMMENT_SELECTOR, {
        visible: true,
        timeout: timeoutMS,
      });
      sendLogToRenderer(`🔍 Found comment input selector`);

      // Clear existing content
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = "";
      }, TIKTOK_CONSTANTS.COMMENT_SELECTOR);

      const el = await page.$(TIKTOK_CONSTANTS.COMMENT_SELECTOR);
      if (!el) throw new Error("❌ Comment input not found");

      await el.click();
      await el.type(text, { delay: 30 });
      sendLogToRenderer(`⌨️ Entered comment: "${text}"`);

      //Find and click post button
      await page.waitForSelector(TIKTOK_CONSTANTS.POST_BUTTON_SVG_PATH, {
        visible: true,
        timeout: timeoutMS,
      });

      const postBtn = await page.$(TIKTOK_CONSTANTS.POST_BUTTON_SVG_PATH);
      if (!postBtn) throw new Error("❌ Post button not found");

      const clickableDiv = await postBtn.evaluateHandle((el) =>
        el.closest("div[tabindex='0']")
      );
      if (!clickableDiv) throw new Error("❌ Clickable post button not found");
      await (clickableDiv as ElementHandle<Element>).click();
      sendLogToRenderer(`✅ Comment thành công ở profile ${profileName} !`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendLogToRenderer(`❌ Comment submission error: ${message}`);
      throw error;
    }
  }

  async shareContent({ chromeIDS, link }: ShareParams): Promise<void> {
    const profileIds = chromeIDS;
    const targetLink = link;
    if (!targetLink) {
      sendLogToRenderer("❌ Không có đường dẫn để share");
      return;
    }
    sendLogToRenderer(`🧮 Tổng số lượng Profile (Share): ${profileIds.length}`);

    //GIỐNG NHƯ TẠO THREAD Ở ĐÂY MAX_CONCURENCY LÀ 3 . VÍ DỤ CÓ 6 PROFILE NÓ sẽ chia ra làm 2 batch để xử lý , mỗi batch chạy 3 profiles
    const batches = this.createBatches(
      profileIds,
      COMMON_CONSTANTS.MAX_CONCURRENCY
    );
    for (const batch of batches) {
      await Promise.all(
        batch.map(async (chromeID) => {
          await this.processProfile(chromeID, async (page, profileName) => {
            sendLogToRenderer(`👤 Bắt đầu share ở profile :${profileName}`);
            //NẾU PAGE Ở VỊ TRÍ HIỆN TẠI URL KHÁC VỚI URL NGƯỜI DÙNG CHỈ ĐỊNH THÌ NAVIGATE
            await this.navigateIfNeeded(page, targetLink);
            await this.excuteShare(page);
            sendLogToRenderer(
              `✅ Share Profile Thành Công !!!: "${profileName}"`
            );
          });
        })
      );
    }
  }

  async handleRegularComments(
    commentList: string[],
    chromeIDS: string[],
    acceptDupplicate: boolean,
    delay: number
  ): Promise<void> {
    const usedComments = new Set<string>();
    sendLogToRenderer(
      `🎯 Chế độ comment: ${
        acceptDupplicate ? "✅ Cho phép trùng" : "🚫 Không trùng"
      }`
    );
    for (const chromeID of chromeIDS) {
      let comment: string | undefined;
      const maxTries = 5;

      // Tìm comment không trùng (nếu cần)
      for (let tries = 0; tries < maxTries; tries++) {
        comment = commentList[Math.floor(Math.random() * commentList.length)];
        // Nếu cho phép trùng hoặc comment chưa sử dụng thì dừng tìm
        if (acceptDupplicate || !usedComments.has(comment)) break;
        // Nếu đến lần thử cuối cùng, cho phép trùng để không bị dừng
        if (tries === maxTries - 1) break;
      }

      // Nếu không tìm được comment hợp lệ
      if (!comment || (!acceptDupplicate && usedComments.has(comment))) {
        sendLogToRenderer(`⚠️ Trùng comment, bỏ qua`);
        continue;
      }

      // Xử lý profile với comment
      await this.processProfile(chromeID, async (page, profileName) => {
        await this.enterCommentAndSubmit(page, comment, profileName);
        usedComments.add(comment);
      });
      sendLogToRenderer(
        `⏱️ Thời gian delay ${delay} giây trước khi comment tiếp !!`
      );
      // Đợi trước khi tiếp tục profile tiếp theo
      await this.sleep(delay * 1000);
    }
  }

  async handleAutomaticComments(
    commentList: string[],
    chromeIDS: string[],
    delay: number
  ): Promise<void> {
    //
    sendLogToRenderer(
      `🎯 Tự động comments (60s) cho đến khi nào hết comments !!`
    );
    const usedComments = new Set<string>();
    const batchSize = 10;
    let commentIndex = 0;
    const totalComments = commentList.length;
    const batchNumber = Math.floor(commentIndex / batchSize) + 1;
    sendLogToRenderer(`🎯 batch Size ${batchSize}!!`);
    sendLogToRenderer(`🎯 batch Number ${batchNumber}!!`);
    sendLogToRenderer(`🎯 Chrome Profile Length ${chromeIDS.length}!!`);

    while (commentIndex < totalComments) {
      for (let i = 0; i < batchSize; i++) {
        if (commentIndex >= totalComments) break;
        const batch = chromeIDS.slice(0, batchSize);
        sendLogToRenderer(
          `🔄 Đang xử lý batch ${batchNumber} với ${batch.length} profile`
        );
        for (const chromeID of batch) {
          const comment = commentList[commentIndex];

          if (!comment || commentIndex >= totalComments) break;
          if (usedComments.has(comment)) {
            sendLogToRenderer(`⚠️ Trùng comment, bỏ qua`);
            continue;
          }

          sendLogToRenderer(`🔄 Chrome Profile Đang xử lý: ${chromeID}`);
          await this.processProfile(chromeID, async (page, profileName) => {
            await this.enterCommentAndSubmit(page, comment, profileName);
            usedComments.add(comment);
            sendLogToRenderer(`✅ Đã comment: ${comment}`);
          });

          // Tăng chỉ số comment sau khi xử lý xong
          commentIndex++;
          if (commentIndex >= totalComments) break;

          // Delay giữa các comment
          await this.sleep(delay * 1000);
          sendLogToRenderer(
            `⏱️ Thời gian delay ${delay} giây trước khi comment tiếp !!`
          );
        }

        // Điều kiện delay sau batch (trừ batch cuối)
        if (commentIndex < totalComments) {
          sendLogToRenderer(
            `⏱️ Đợi 60 giây trước khi xử lý batch tiếp theo...`
          );
          await this.sleep(60 * 1000);
        }
      }
      sendLogToRenderer(`✅ Đã Auto Comment Seeding Thành Công !!! "`);
    }
    //       sendLogToRenderer(
    //         `⏱️ Đợi 60 giây trước khi xử lý batch tiếp theo.`
    //       );
  }
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async commentOnContent({
    delay = 2000,
    ...data
  }: CommentParams): Promise<void> {
    try {
      const commentList = data.comments
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (data.chromeIDS.length === 0) {
        sendLogToRenderer(
          "⚠️ Vui lòng cung cấp Danh sách  Chrome Profile để seeding comments !!"
        );
        return;
      }
      sendLogToRenderer(
        `📝 Bắt đầu comment seeding với ${data.chromeIDS.length} profiles và ${commentList.length} comments`
      );
      sendLogToRenderer(`📝 Thời gian delay cho mỗi profile là ${delay}`);

      const navigateLinkSeeding = data.chromeIDS.map((chromeID) =>
        this.processProfile(chromeID, async (page) => {
          if (data.link) {
            await this.navigateIfNeeded(page, data.link);
          }
        })
      );
      await Promise.all(navigateLinkSeeding);
      // XÁO TRỘN CHROME ID CHO COMMENT RANDOM !!!
      const chromeWithShuffle = shuffleArray(data.chromeIDS);
      if (data.allowAutoCmtAfter60s) {
        await this.handleAutomaticComments(
          commentList,
          chromeWithShuffle,
          delay
        );
      } else {
        await this.handleRegularComments(
          commentList,
          chromeWithShuffle,
          data.acceptDupplicateComment,
          delay
        );
      }
    } catch (err) {
      sendLogToRenderer(
        `⚠️ Có lỗi xảy ra trong quá trình seeding comments ${err.message}`
      );

      throw new Error("Method not implemented.");
    }
  }
}
