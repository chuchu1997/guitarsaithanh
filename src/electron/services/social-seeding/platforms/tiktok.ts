/** @format */

import { Page, ElementHandle } from "puppeteer-core";
import { sendLogToRenderer } from "../../../utils/log.utils";
import { shuffleArray } from "../../../utils/system.utils";
import { SocialSeeding, COMMON_CONSTANTS } from "../base";
import { closeBrowser, openChromeProfile } from "../../browser.service";
import {
  BaseSeeding,
  SeedingCommentParams,
  SeedingCommentsExcuteBase,
  SeedingCommentsRegular,
} from "src/electron/types";
import { getStopSeeding, setStopSeeding } from "../stop-signal";

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

  LOGIN_BUTTON_SELECTOR: "div[contains(text(), 'email')]",
  LOGIN_BUTTON_XPATH: "//button[.//div[contains(text(), 'Đăng nhập')]]",
};

export class TiktokSeeding extends SocialSeeding {
  constructor() {
    super();
    setStopSeeding(false);
  }
  /**
   * Enter text into TikTok's comment box and submit
   */

  /**
   * Kiểm tra trạng thái dừng
   */

  async checkAuthTiktokLogin(page: Page): Promise<void> {
    try {
      sendLogToRenderer(`🛑 Có check auth !! !`);

      const unLogin = await page.waitForSelector(
        TIKTOK_CONSTANTS.LOGIN_BUTTON_XPATH,
        {
          visible: true,
          timeout: 3000,
        }
      );
      sendLogToRenderer(`🛑 Đã tìm thấy button login !! !`);

      if (unLogin) {
        await page.click(TIKTOK_CONSTANTS.LOGIN_BUTTON_XPATH);
        const buttonLoginEmail = await page.waitForSelector(
          TIKTOK_CONSTANTS.LOGIN_BUTTON_SELECTOR,
          {
            visible: true,
            timeout: 1000,
          }
        );
        sendLogToRenderer(`🛑 Phát hiện người dùng chưa đăng nhập !`);

        if (buttonLoginEmail) {
          await page.click(TIKTOK_CONSTANTS.LOGIN_BUTTON_SELECTOR);
        }
      }
    } catch (e) {
      // Có thể tiếp tục hành động khác ở đây
    }
  }

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
      await this.sleep(1000);
      await page.click(TIKTOK_CONSTANTS.SHARE_LINK_SELECTOR);

      // SAU KHI SHARE XONG MOVE CURSOR RA NGOÀI ĐỂ TẮT DROPDOWN HOVER !!1

      await page.mouse.move(0, 0);
      sendLogToRenderer(`✅ Đã share profile  !`);
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

      await page.waitForSelector(TIKTOK_CONSTANTS.POST_BUTTON_SVG_PATH, {
        visible: true,
        timeout: timeoutMS,
      });

      const postBtn = await page.$(TIKTOK_CONSTANTS.POST_BUTTON_SVG_PATH);
      if (!postBtn) throw new Error("❌ Post button not found");

      const clickableDiv = await postBtn.evaluateHandle((el) =>
        el.closest("div[tabindex='0']")
      );
      await this.sleep(1000);
      if (!clickableDiv) throw new Error("❌ Clickable post button not found");
      await (clickableDiv as ElementHandle<Element>).click();
      await this.sleep(1000);
      sendLogToRenderer(`✅ Comment thành công ở profile ${profileName} !`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendLogToRenderer(`❌ Comment submission error: ${message}`);
      throw error;
    }
  }

  async autoFillLogin(params: BaseSeeding): Promise<void> {
    const { chromeProfiles, link } = params;

    await openChromeProfile({
      cookie: chromeProfiles[0].cookie,
      id: chromeProfiles[0].id,
      profilePath: chromeProfiles[0].profilePath,
      proxy: chromeProfiles[0].proxy,
      headless: chromeProfiles[0].headless,
      link: params.link,
    });

    if (getStopSeeding()) {
      sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);
      return; // Exit the function early
    }

    try {
      await this.processProfile(
        chromeProfiles[0].id,
        async (page, profileName) => {
          if (params.link) {
            await this.navigateIfNeeded(page, params.link);

            await this.onFillCookieToLogin(chromeProfiles[0].cookie ?? "");

            await this.sleep(3000);
          }
        }
      );
      return;
    } catch (err) {}
  }
  async onFillCookieToLogin(cookie: string) {
    if (cookie !== "") {
      /// EXCUTE !!!
    }
  }

  async shareContent(params: BaseSeeding): Promise<void> {
    const batchSize = 3;
    // MỖI LẦN XỬ LÝ 3 PROFILE THÔI !!!
    const batches = this.chunkArray(params.chromeProfiles, batchSize);

    for (const batch of batches) {
      await Promise.all(
        batch.map((profile) =>
          openChromeProfile({
            cookie: profile.cookie,
            id: profile.id,
            profilePath: profile.profilePath,
            proxy: profile.proxy,
            headless: profile.headless,
            link: params.link,
          })
        )
      );
      if (getStopSeeding()) {
        sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);
        return; // Exit the function early
      }

      for (const profile of batch) {
        if (getStopSeeding()) {
          sendLogToRenderer(`🛑 Đang đóng trình duyệt và dừng quá trình!`);
          await closeBrowser(profile.id);
          continue;
        }
        try {
          await this.processProfile(profile.id, async (page, profileName) => {
            //
            if (params.link) {
              await this.navigateIfNeeded(page, params.link);
            }
            await this.excuteShare(page);
            sendLogToRenderer(
              `✅ Share Profile Thành Công !!!: "${profileName}"`
            );
            await this.sleep(3000);
            await closeBrowser(profile.id);
          });
        } catch (err) {
          sendLogToRenderer(
            `🎯 Profile này dính capcha hoặc chưa đăng nhập không share được !!!`
          );
          await closeBrowser(profile.id);
        }
      }
    }
  }

  chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
  async handleRegularComments({
    ...data
  }: SeedingCommentsRegular): Promise<void> {
    const usedComments = new Set<string>();
    sendLogToRenderer(
      `🎯 Chế độ comment: ${
        data.acceptDupplicateComment ? "✅ Cho phép trùng" : "🚫 Không trùng"
      }`
    );

    const batchSize = 3;
    // MỖI LẦN XỬ LÝ 3 PROFILE THÔI !!!
    const batches = this.chunkArray(data.chromeProfiles, batchSize);

    if (data.acceptDupplicateComment) {
      data.comments = shuffleArray(data.comments);
    }
    for (const batch of batches) {
      if (getStopSeeding()) {
        sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);
        return; // Exit the function early
      }
      if (
        !data.acceptDupplicateComment &&
        usedComments.size >= data.comments.length
      ) {
        sendLogToRenderer(
          `✅ Đã sử dụng hết comment hợp lệ, dừng xử lý các profile còn lại.`
        );
        break;
      }
      const shuffledBatch = shuffleArray(batch);

      //XÁO TRỘN 3 PROFILE VỊ TRÍ RANDOM !!!
      await Promise.all(
        batch.map((profile) =>
          openChromeProfile({
            cookie: profile.cookie,
            id: profile.id,
            profilePath: profile.profilePath,
            proxy: profile.proxy,
            headless: profile.headless,
            link: data.link,
          })
        )
      );
      this.sleep(1000);
      console.log("CALL THIS");

      for (const [index, profile] of shuffledBatch.entries()) {
        if (getStopSeeding()) {
          sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);
          await closeBrowser(profile.id);
          return; // Exit the function early
        }
        let comment: string | undefined;
        const maxTries = 5;
        for (let tries = 0; tries < maxTries; tries++) {
          comment =
            data.comments[Math.floor(Math.random() * data.comments.length)];
          // Nếu cho phép trùng hoặc comment chưa sử dụng thì dừng tìm
          if (data.acceptDupplicateComment || !usedComments.has(comment)) break;
          // Nếu đến lần thử cuối cùng, cho phép trùng để không bị dừng
          if (tries === maxTries - 1) break;
        }

        // Nếu không tìm được comment hợp lệ
        if (
          !comment ||
          (!data.acceptDupplicateComment && usedComments.has(comment))
        ) {
          sendLogToRenderer(`⚠️ Trùng comment, bỏ qua`);
          await closeBrowser(profile.id);
          continue;
        }
        await this.processProfile(profile.id, async (page, profileName) => {
          // NẾU CHƯA ĐI ĐẾN ĐƯỜNG DẪN THÌ ĐI ĐẾN
          await this.checkAuthTiktokLogin(page);
          if (data.link) {
            await this.navigateIfNeeded(page, data.link);
          }
          await this.enterCommentAndSubmit(page, comment, profileName);
          usedComments.add(comment);
          //FIXME:
          // await closeBrowser(profile.id);
          const isLastProfile = index === shuffledBatch.length - 1;
          const isLastBatch = batches.at(-1)?.includes(profile);

          if (!(isLastBatch && isLastProfile)) {
            sendLogToRenderer(
              `⏱️ Thời gian delay ${data.delay} giây trước khi comment tiếp !!`
            );
            await this.sleep(data.delay * 1000);
          } else {
            sendLogToRenderer(`✅ Đã xử lý profile cuối cùng, không delay.`);
          }
        });
      }
    }
  }

  async handleAutomaticComments(
    // commentList: string[],
    // chromeIDS: string[],
    // delay: number
    { ...params }: SeedingCommentsRegular
  ): Promise<void> {
    setStopSeeding(false);

    //
    sendLogToRenderer(`🎯 Tự động comments  cho đến khi nào hết comments !!`);
    // Track which comments have been used to avoid duplicates
    const usedComments = new Set<string>();

    // Batch size for parallel execution
    const batchSize = 3;
    // Process comments until all are used

    let commentIndex = 0;

    const totalProfiles = params.chromeProfiles.length;

    // Log initial information
    const totalComments = params.comments.length;
    // let processedProfileCount = 0; // biến đếm profile đã xử lý

    sendLogToRenderer(`🎯 Total comments: ${totalComments}`);
    sendLogToRenderer(`🎯 Batch size: ${batchSize}`);

    // const batches = this.chunkArray(params.chromeProfiles, batchSize);
    if (params.acceptDupplicateComment) {
      params.comments = shuffleArray(params.comments);
    }
    while (commentIndex < totalComments) {
      if (getStopSeeding()) {
        sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);

        return; // Exit the function early
      }
      if (usedComments.size >= totalComments) {
        sendLogToRenderer(
          `✅ All ${totalComments} comments have been processed!`
        );
        return; // THAY VÌ break (vì bạn không muốn vòng ngoài chạy tiếp)
      }
      const remainingComments = totalComments - commentIndex;
      const commentsToProcess = Math.min(remainingComments, totalProfiles);
      const profileBatches = this.chunkArray(
        // Loop through profiles if needed by using modulo
        Array.from(
          { length: commentsToProcess },
          (_, i) => params.chromeProfiles[i % totalProfiles]
        ),
        batchSize
      );
      for (let batchNum = 0; batchNum < profileBatches.length; batchNum++) {
        const currentBatch = profileBatches[batchNum];
        const shuffledBatch = shuffleArray(currentBatch);
        if (getStopSeeding()) {
          sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);

          return; // Exit the function early
        }
        await Promise.all(
          shuffledBatch.map((profile) =>
            openChromeProfile({
              cookie: profile.cookie,
              id: profile.id,
              profilePath: profile.profilePath,
              proxy: profile.proxy,
              headless: profile.headless,
              link: params.link,
            })
          )
        );

        for (const [index, profile] of shuffledBatch.entries()) {
          if (getStopSeeding()) {
            sendLogToRenderer(`🛑 Đã dừng quá trình seeding theo yêu cầu!`);
            await closeBrowser(profile.id);
            return; // Exit the function early
          }

          let comment: string | undefined;
          for (let i = 0; i < params.comments.length; i++) {
            if (!usedComments.has(params.comments[i])) {
              comment = params.comments[i];
              usedComments.add(comment);
              break;
            }
          }
          if (comment) {
            sendLogToRenderer(
              `🎯 Profile ${profile} commenting: ${comment.substring(0, 30)}...`
            );
            commentIndex++;
            try {
              await this.processProfile(
                profile.id,
                async (page, profileName) => {
                  // NẾU CHƯA ĐI ĐẾN ĐƯỜNG DẪN THÌ ĐI ĐẾN
                  if (params.link) {
                    await this.navigateIfNeeded(page, params.link);
                  }
                  await this.enterCommentAndSubmit(page, comment, profileName);
                  usedComments.add(comment);
                  await closeBrowser(profile.id);
                }
              );

              // Here you would implement the actual commenting logic
              // For example:
              // await this.processComment(profile, comment);

              // Simulate processing time
              await this.sleep(params.delay * 1000);
            } catch (error) {
              await closeBrowser(profile.id);
              sendLogToRenderer(`❌ Error with profile ${profile}: ${error}`);
            }
          }
          // processedProfileCount++;

          // Optional delay between batches if needed
          // if (batchNum < profileBatches.length - 1) {
          //   await this.sleep( 60000);
          //   sendLogToRenderer(`🎯 Tự động comments  cho đến khi nào hết comments !!`);

          // }
        }

        // if (processedProfileCount >= 10) {
        //   sendLogToRenderer(
        //     `⏱️ Đã xử lý 10 profile, đang đợi 60 giây trước khi tiếp tục...`
        //   );
        //   await this.sleep(60000);

        //   processedProfileCount = 0;
        // }
        // Check if we've used all comments
        if (usedComments.size >= params.comments.length) {
          sendLogToRenderer(
            `✅ All ${totalComments} comments have been processed!`
          );
          break;

          //
        }
      }
    }
  }
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async commentOnContent({
    delay = 2000,
    ...data
  }: SeedingCommentParams): Promise<void> {
    try {
      const commentList = data.comments
        .split(/[,\n]/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (!data.allowAutoCmtAfter60s) {
        await this.handleRegularComments({
          chromeProfiles: data.chromeProfiles,
          comments: commentList,
          link: data.link,
          delay: delay,
          acceptDupplicateComment: data.acceptDupplicateComment,
        });
        //
      } else {
        await this.handleAutomaticComments({
          chromeProfiles: data.chromeProfiles,
          comments: commentList,
          link: data.link,
          delay: delay,
          acceptDupplicateComment: data.acceptDupplicateComment,
        });
        //
      }
    } catch (err) {
      sendLogToRenderer(
        `⚠️ Có lỗi xảy ra trong quá trình seeding comments ${err.message}`
      );
      throw new Error("Method not implemented.");
    }
  }
}
