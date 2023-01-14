import { createApp } from "vue"
import App from "./App.vue"

function showConsoleInTextArea() {
  const consoleTextArea = document.querySelector("#console")
  if (!consoleTextArea) return
  const consoleLog = console.log
  console.log = function (...message: any[]) {
    consoleLog(...message)
    consoleTextArea.innerHTML =
      message.join(",") + "<br/>" + consoleTextArea.innerHTML
  }
  consoleTextArea.addEventListener("click", () => {
    consoleTextArea.innerHTML = ""
  })
}

export function run() {
  const appDom = document.querySelector("#app")
  if (!appDom) throw new Error("app dom not found")
  appDom.classList.toggle("hidden")
  const app = createApp(App)
  app.mount(appDom)

  showConsoleInTextArea()

  return app
}
