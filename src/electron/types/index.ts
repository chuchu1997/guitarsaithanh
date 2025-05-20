import { Browser, Page } from "puppeteer-core";

export interface BrowserProfile {
  browser: Browser;
  page: Page;
  profilePath: string;
}

export interface ProfileParams {
  id: string;
  profilePath: string;
  proxy?: string;
  headless?: boolean;
  link?:string;

}



export interface BaseSeeding  { 
  startSeeding?:boolean;
  chromeProfiles:ProfileParams[]
  link:string;

}
export type ShareParams = BaseSeeding


export interface SeedingCommentParams extends BaseSeeding {
  comments:string;
  delay?: number;
  acceptDupplicateComment?: boolean;
  allowAutoCmtAfter60s?:boolean;
}

// acceptDupplicateComment: boolean;
export interface SeedingCommentsExcuteBase extends BaseSeeding  {
  comments:string[]
  
  delay:number;
  
}

export interface SeedingCommentsRegular extends SeedingCommentsExcuteBase{
  acceptDupplicateComment: boolean;
}  
