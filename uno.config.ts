import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      // 移除 Google Fonts 引用，使用本地图标
      collections: {},
    }),
  ],
  theme: {
    colors: {
      primary: "#DF7623",
    },
  },
  darkMode: "class",
});
