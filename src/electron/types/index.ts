import { Browser, Page } from "puppeteer-core";

export interface BrowserProfile {
  browser: Browser;
  page: Page;
  profilePath: string;
}

export interface ProfileParams {
  id: string;
  profilePath: string;
  proxyPath?: string;
  totalProfile?: number;
  headless?: boolean;
}

export interface ShareParams {
  chromeIDS: string[];
  linkLive: string;
}

export interface SeedingCommentParams {
  chromeProfileIds: string[];
  comments: string;
  link: string;
  delay?: number;
  acceptDupplicateComment?: boolean;
  allowAutoCmtAfter60s?:boolean;

}

