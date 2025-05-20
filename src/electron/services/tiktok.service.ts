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

/**
 * Share TikTok livestream with multiple profiles
 */
export async function shareLivestream({ chromeIDS, linkLive }: any): Promise<void> {
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
