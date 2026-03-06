import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: "#DF7623",
    },
  },
  darkMode: "class",
});
