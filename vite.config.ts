import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import Unocss from "unocss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Unocss({
      content: {
        filesystem: ["src/**/*.{vue,ts,js}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 分离第三方库
          vendor: ['vue', 'vue-router', 'pinia'],
          // 分离大型依赖
          three: ['three'],
          // 分离UI库
          ui: ['naive-ui'],
          // 分离工具库
          utils: ['@vueuse/core', 'dayjs'],
          // 分离图表库
          charts: ['echarts', 'vue-echarts'],
        },
      },
    },
    // 调整chunk大小警告限制
    chunkSizeWarningLimit: 500,
  },
});
