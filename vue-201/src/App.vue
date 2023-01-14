<template>
  <main>
    <form :class="!state.lastMessageReceived ? 'no-response-yet' : ''">
      <h1 class="banner">Secure Chat</h1>
      <input
        ref="wordDomElement"
        type="text"
        v-model="state.threeWords"
        placeholder="[Any three words]"
      />
      <div class="history" v-html="state.lastMessageReceived"></div>
      <textarea
        ref="messageDomElement"
        v-model="state.messageText"
        class="message"
        placeholder="[ENTER YOUR MESSAGE]"
        @keydown="sendOnShiftEnter"
        @dblclick.prevent="() => send()"
      >
      </textarea>
      <button
        :disabled="!state.messageText"
        type="submit"
        @click.prevent="send"
        title="Press Shift+Enter to send"
      >
        Send
      </button>
      <div id="console"></div>
    </form>
  </main>
</template>

<style>
main {
  color: var(--color-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow-y: auto;
}

form {
  display: grid;
  grid-template-rows: calc(3em + 5vw) 3em 2fr 1fr 3em 2em;
  width: 80vw;
  height: max(30em, 100vh);
  gap: 1em;
}

#console {
  z-index: -1;
  /* user cannot click */
  pointer-events: none;
  border: 1px solid var(--color-cipher);
  height: 100%;
  overflow: hidden;
  font-size: x-small;
}

form > input {
  margin: 0;
}

form > textarea {
  resize: none;
  margin: 0;
  padding: 0.5em;
}

form > .history {
  overflow-y: auto;
  padding: 0.5em;
  border-left: 3px solid var(--color-cipher);
  transition-duration: 2000ms;
}

form.no-response-yet > .history {
  display: none;
}

form > .message {
  color: var(--color-font);
  background-color: var(--color-background);
}

form.no-response-yet > .message {
  grid-row: span 2;
}

form > button {
  background-color: var(--color-cipher);
  height: 100% !important;
}

.response {
  display: inline-block;
  padding: 0.5em;
  outline: 1px solid var(--color-cipher-lite);
  border-radius: 8px;
  margin-top: 0.5em;
  overflow: hidden;
  word-wrap: break-word;
  max-width: 90%;
}

.in.response {
  margin-left: 0.5em;
  color: var(--color-cipher);
  background-color: var(--color-cipher-lite);
  border-top-left-radius: 0;
}

.out.response {
  font-size: smaller;
  margin-right: 0.5em;
  color: var(--color-cipher-lite);
  background-color: var(--color-cipher);
  border-bottom-right-radius: 0;
  float: right;
}
</style>

<script setup lang="ts">
import { listen as listenToServer, send as sendToServer } from "./socket"
import { onBeforeMount, onMounted, reactive, ref } from "vue"
import { decrypt, encrypt } from "./crypt"

const state = reactive({
  messageText: "",
  threeWords: "",
  lastMessageReceived: "",
})

const wordDomElement = ref<HTMLInputElement | null>(null)
const messageDomElement = ref<HTMLTextAreaElement | null>(null)

function sendOnShiftEnter(e: KeyboardEvent) {
  if (e.key === "Enter" && e.shiftKey) {
    send()
    // disable further handling
    e.preventDefault()
  }
}

function scrollToBottom() {
  setTimeout(() => {
    const div = document.querySelector(".history")
    if (div) {
      div.scrollTop = div.scrollHeight
    }
  }, 500)
}

listenToServer((message: string) => {
  // persist the key
  localStorage.setItem("threeWords", state.threeWords)
  message = decrypt(state.threeWords, message)
  renderInboundMessage(message)
})

const send = () => {
  const words = state.threeWords.split(" ").map((v) => v.trim())
  if (words.length !== 3) {
    console.log("Please enter three words")
    wordDomElement.value?.focus()
    return
  }
  if (words.some((w) => w.length < 5)) {
    console.log("Each word must have at least 5 characters")
    wordDomElement.value?.focus()
    return
  }

  const message = encrypt(state.threeWords, state.messageText)
  sendToServer(message)

  // trigger change on messageText
  renderOutboundMessage(state.messageText)
  state.messageText = ""
  messageDomElement.value?.focus()
}

function renderInboundMessage(message: string) {
  state.lastMessageReceived += `<div class="in response">${message}</div><br/>`
  scrollToBottom()
}

function renderOutboundMessage(message: string) {
  state.lastMessageReceived += `<div class="out response">${state.messageText}</div><br/>`
  scrollToBottom()
}

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

onBeforeMount(() => {
  const threeWords = localStorage.getItem("threeWords")
  if (threeWords) {
    state.threeWords = threeWords
  }
})

onMounted(() => {
  wordDomElement.value?.focus()
  wordDomElement.value?.select()
  showConsoleInTextArea()
  console.log("Welcome to Secure Chat. Please enter three words to start.")
})
</script>
