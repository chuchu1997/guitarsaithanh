import { defineConfig } from "vite";
import commonjsExternals from "vite-plugin-commonjs-externals";

export default defineConfig({
  plugins: [
    // Tránh bundling các thư viện CommonJS lớn
    commonjsExternals({
      externals: [
        // "selenium-webdriver",
        // "chromedriver",
        // "selenium-webdriver/chrome",
        // "chrome-launcher",
      ],
    }),
   
    // Nếu sau này cần thêm plugin xử lý dynamic import, bạn có thể thêm ở đây
  ],

  build: {
    
      chunkSizeWarningLimit: 2000, // tăng từ 500kB lên 2000kB, không cảnh báo nữa
    
  },

});
