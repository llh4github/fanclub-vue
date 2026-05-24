import { createApp } from "vue"
import "./style.css"
import "go-captcha-vue/dist/style.css"
import "animate.css"
import "viewerjs/dist/viewer.css"
import AOS from "aos"
import "aos/dist/aos.css"
import App from "./App.vue"
import router from "./router"
import VueViewer from "v-viewer"

const app = createApp(App)
app.use(router)
app.use(VueViewer)

// Initialize AOS
AOS.init({
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 50,
})

app.mount("#app")
