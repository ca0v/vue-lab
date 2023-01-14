import { createApp } from "vue"
import App from "./App.vue"

export function run() {
  const appDom = document.querySelector("#app")
  if (!appDom) throw new Error("app dom not found")
  appDom.classList.toggle("hidden")
  const app = createApp(App)
  app.mount(appDom)
  return app
}
