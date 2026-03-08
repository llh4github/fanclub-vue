import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        "material-symbols": {
          urls: ["https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"],
        },
      },
    }),
  ],
  theme: {
    colors: {
      primary: "#DF7623",
    },
  },
  darkMode: "class",
});
