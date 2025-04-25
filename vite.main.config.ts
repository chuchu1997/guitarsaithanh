import { defineConfig } from "vite";
import commonjsExternals from "vite-plugin-commonjs-externals";
export default defineConfig({
  plugins: [
    // Sử dụng commonjsExternals để tránh bundling selenium-webdriver và chromedriver
    commonjsExternals({
      externals: [
        "selenium-webdriver",
        "chromedriver",
        "selenium-webdriver/chrome",
        "chrome-launcher",
      ],
    }),

    // Cấu hình plugin commonjs để xử lý dynamic imports
  ],
});
