import { SocialSeeding } from "./base";
import { TiktokSeeding } from "./platforms/tiktok";



// Factory to create appropriate seeding service
export function createSeedingService(platform: "tiktok" | "facebook" | "youtube"): SocialSeeding {
  switch (platform) {
    case "tiktok":
      return new TiktokSeeding();
    // case "facebook":
    //   return new FacebookSeeding();
    // case "youtube":
    //   return new YouTubeSeeding();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
}