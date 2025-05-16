// src/services/tiktok-service.ts
import { Page, ElementHandle } from "puppeteer-core";
import { sendLogToRenderer } from "../utils/log.utils";
import { closeBrowser, detectCaptcha, getBrowserProfile } from "./browser.service";
import { ShareParams, SeedingCommentParams  } from "../types";
import { shuffleArray } from "../utils/system.utils";
import path from "path";

// Constants
const MAX_CONCURRENCY = 3;
const DEFAULT_COMMENT = "Hello livestream 👋";

/**
 * Enter text into TikTok's comment box
 */
async function enterTextIntoContentEditable(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const timeoutMS = 6000;

  try {
    await page.waitForSelector(selector, { visible: true, timeout: timeoutMS });
    sendLogToRenderer(`🔍 Tìm selector đầu tiên: ${selector}`);

    // Clear existing content
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = "";
    }, selector);

    const el = await page.$(selector);
    if (!el) throw new Error("❌ Không tìm thấy input comment");

    await el.click();
    await el.type(text, { delay: 30 });
    sendLogToRenderer(`⌨️ Đã nhập comment: "${text}"`);

    // Find and click post button
    const postSvgSelector = 'svg path[d^="M45.7321 7.00001"]';
    await page.waitForSelector(postSvgSelector, {
      visible: true,
      timeout: timeoutMS,
    });

    const postBtn = await page.$(postSvgSelector);
    if (!postBtn) throw new Error("❌ Không tìm thấy nút gửi comment");

    const clickableDiv = await postBtn.evaluateHandle((el) =>
      el.closest("div[tabindex='0']")
    );
    if (!clickableDiv) throw new Error("❌ Không tìm thấy nút gửi comment");

    await (clickableDiv as ElementHandle<Element>).click();
    sendLogToRenderer(`✅ Comment đã được gửi thành công!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendLogToRenderer(`❌ Lỗi khi gửi comment: ${message}`);
    throw error;
  }
}

/**
 * Share TikTok livestream with multiple profiles
 */
export async function shareLivestream({ chromeIDS, linkLive }: ShareParams): Promise<void> {
  sendLogToRenderer(`🧮 Tổng cộng số lượng profile sẽ chạy share live: ${chromeIDS.length}`);

  // Process in batches to manage concurrency
  const chunks: string[][] = [];
  for (let i = 0; i < chromeIDS.length; i += MAX_CONCURRENCY) {
    chunks.push(chromeIDS.slice(i, i + MAX_CONCURRENCY));
  }

  for (const batch of chunks) {
    await Promise.all(
      batch.map(async (chromeID) => {
        const instance = getBrowserProfile(chromeID);
        if (!instance) {
          sendLogToRenderer(`⚠️ Không tìm thấy instance cho profile để share: ${chromeID}`);
          return;
        }

        const { page } = instance;
        const profileName = path.basename(instance.profilePath);

        try {
          sendLogToRenderer(`👤 Bắt đầu chạy share profile: ${profileName}`);

          // Navigate to livestream if needed
          if (page.url() !== linkLive) {
            sendLogToRenderer(`👤 Chuyển hướng đến: ${linkLive}`);
            await page.goto(linkLive, {
              waitUntil: "networkidle2",
              timeout: 60000,
            });
          }

          // Check for CAPTCHA
          if (await detectCaptcha(page)) {
            sendLogToRenderer(
              `❌ Đã phát hiện CAPTCHA trên profile ${profileName}, bỏ qua profile này.`
            );
            await closeBrowser(chromeID);
            return;
          }

          // Try to share the livestream, which also verifies login status
          try {
            // Check if share icon exists and can be interacted with - this verifies login
            await page.waitForSelector('i[data-e2e="share-icon"]', {
              visible: true,
              timeout: 3000, // Maximum wait time for icon to appear
            });

            await page.hover('i[data-e2e="share-icon"]');

            // Wait for share link to appear after hover
            await page.waitForSelector('a[data-e2e="share-link"][href="#"]', {
              visible: true,
              timeout: 3000, // Maximum wait time for share menu to appear
            });

            await page.click('a[data-e2e="share-link"][href="#"]');
          } catch (error) {
            // If any step fails, user is likely not logged in
            sendLogToRenderer(
              `❌ Profile ${profileName} có thể chưa đăng nhập, không thể share. Lỗi: ${error.message}`
            );
            await closeBrowser(chromeID);
            return;
          }
          await page.mouse.move(0, 0); // Avoid hovering icon again

          sendLogToRenderer(`✅ Đã share thành công ở profile: "${profileName}"`);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          sendLogToRenderer(`❌ Lỗi khi share profile ${profileName}: ${errorMessage}`);
        }
      })
    );
  }
}

/**
 * Seed comments on TikTok livestream in a batch process
 */
// export async function seedLivestreamBatch({
//   chromeProfileIds,
//   comments,
//   linkLiveStream,
// }: BatchSeedingParams): Promise<void> {
//   try {
//     // Parse comments and ensure no duplicates
//     const commentList = Array.from(
//       new Set(
//         comments
//           .split(/[\n,]/)
//           .map((c) => c.trim())
//           .filter(Boolean)
//       )
//     );
//     const profileQueue = [...chromeProfileIds];
//     const batchSize = 10;

//     sendLogToRenderer(`🧮 Tổng số profile: ${profileQueue.length}`);
//     sendLogToRenderer(`📝 Tổng số comment: ${commentList.length}`);

//     let batchCount = 0;
//     while (commentList.length > 0) {
//       const batchProfiles = profileQueue.splice(0, batchSize);
//       const batchComments = commentList.splice(0, batchSize);

//       sendLogToRenderer(
//         `🚀 Batch ${++batchCount}: Chạy ${batchProfiles.length} profile với ${
//           batchComments.length
//         } comment`
//       );

//       await Promise.all(
//         batchProfiles.map(async (profileId, index) => {
//           const instance = getBrowserProfile(profileId);
//           if (!instance) {
//             sendLogToRenderer(`⚠️ Không tìm thấy instance cho profile: ${profileId}`);
//             return;
//           }

//           const { page } = instance;
//           const profileName = path.basename(instance.profilePath);
//           const comment = batchComments[index];

//           try {
//             sendLogToRenderer(`👤 Đang chạy profile: ${profileName}`);
//             await page.goto(linkLiveStream, {
//               waitUntil: "networkidle2",
//               timeout: 60000,
//             });

//             // Check for CAPTCHA
//             if (await detectCaptcha(page)) {
//               sendLogToRenderer(`❌ CAPTCHA trên ${profileName}, bỏ qua`);
//               await closeBrowser(profileId);
//               return;
//             }

//             // Comment on livestream
//             await enterTextIntoContentEditable(
//               page,
//               "div[contenteditable='plaintext-only']",
//               comment
//             );
//             sendLogToRenderer(`✅ ${profileName} đã comment: "${comment}"`);
//           } catch (err) {
//             sendLogToRenderer(
//               `❌ Lỗi với ${profileName}: ${
//                 err instanceof Error ? err.message : String(err)
//               }`
//             );
//           }
//         })
//       );

//       // Wait before running next batch
//       sendLogToRenderer(`⏳ Chờ ${1} giây trước khi chạy batch tiếp theo`);
//       await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
//     }

//     sendLogToRenderer(`✅ Hoàn tất seeding livestream`);
//   } catch (err) {
//     sendLogToRenderer(
//       `❌ Lỗi nghiêm trọng: ${err instanceof Error ? err.message : String(err)}`
//     );
//   }
// }

/**
 * Seed comments on TikTok livestream
 */
export async function seedingLivestreamComments({
  chromeProfileIds,
  comments,
  delay = 5,
  link,
  acceptDupplicateComment = false,
  allowAutoCmtAfter60s = false
}: SeedingCommentParams): Promise<void> {
  try {
    // Parse comment list
    const commentList = comments
      .split(/[,\n]/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (commentList.length === 0) commentList.push(DEFAULT_COMMENT);

    const usedComments = new Set<string>();
    const shuffledProfiles = shuffleArray(chromeProfileIds);

    sendLogToRenderer(`🧮 Tổng số profile: ${shuffledProfiles.length}`);
    sendLogToRenderer(
      `🎯 Chế độ comment: ${
        acceptDupplicateComment ? "✅ Cho phép trùng" : "🚫 Không trùng"
      }`
    );

    // Process a single profile
    const runProfile = async (profileId: string, delayInSeconds: number) => {
      await new Promise((resolve) => setTimeout(resolve, delayInSeconds * 1000)); // Delay before starting

      const instance = getBrowserProfile(profileId);
      if (!instance) {
        sendLogToRenderer(`⚠️ Không tìm thấy instance cho profile: ${profileId}`);
        return;
      }

      const { page } = instance;
      const profileName = path.basename(instance.profilePath);

      try {
        sendLogToRenderer(`👤 Đang xử lý: ${profileName}`);

        // Navigate to livestream if needed
        if (page.url() !== link) {
          sendLogToRenderer(`🔁 Điều hướng đến: ${link}`);
          await page.goto(link, {
            waitUntil: "networkidle2",
            timeout: 8000,
          });
        }

        // Check for CAPTCHA
        if (await detectCaptcha(page)) {
          sendLogToRenderer(`❌ CAPTCHA trên ${profileName}, bỏ qua`);
          await closeBrowser(profileId);
          return;
        }

        // Select a comment
        let comment: string | undefined;
        const maxTries = 5;

        for (let tries = 0; tries < maxTries; tries++) {
          comment = commentList[Math.floor(Math.random() * commentList.length)];
          // If we accept duplicates or this is a new comment, we can use it
          if (acceptDupplicateComment || !usedComments.has(comment)) break;
          // On last try, accept duplicate if needed
          if (tries === maxTries - 1) break;
        }

        if (!comment || (!acceptDupplicateComment && usedComments.has(comment))) {
          sendLogToRenderer(`⚠️ Trùng comment, bỏ qua: ${profileName}`);
          return;
        }

        // Post the comment
        await enterTextIntoContentEditable(
          page,
          "div[contenteditable='plaintext-only']",
          comment
        );
        usedComments.add(comment);

        sendLogToRenderer(`✅ ${profileName} đã comment: "${comment}"`);
        sendLogToRenderer(`----------------------------------`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        sendLogToRenderer(`❌ Lỗi với ${profileName}: ${errorMsg}`);
      }
    };

    // Process profiles in batches
    const chunks: string[][] = [];
    for (let i = 0; i < shuffledProfiles.length; i += MAX_CONCURRENCY) {
      chunks.push(shuffledProfiles.slice(i, i + MAX_CONCURRENCY));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((profileId, index) => runProfile(profileId, index * delay))
      );
    }

    sendLogToRenderer(`✅ Hoàn tất seeding livestream`);
    sendLogToRenderer(`----------------------------------`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendLogToRenderer(`❌ Lỗi nghiêm trọng: ${errorMessage}`);
  }
}