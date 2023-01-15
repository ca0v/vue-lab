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
      <div class="trick-1">
        <textarea
          ref="messageDomElement"
          v-model="state.messageText"
          class="message"
          placeholder="[ENTER YOUR MESSAGE]"
          @keydown="sendOnShiftEnter"
          @dblclick.prevent="() => send()"
          title="Press Shift+Enter to send"
        >
        </textarea>
        <div @click="send" class="glass-button-hack">↹</div>
      </div>
      <div id="console"></div>
    </form>
  </main>
</template>

<style>
.trick-1 {
  position: relative;
}

.glass-button-hack {
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
  border-radius: 50%;
  background-color: var(--color-cipher);
  width: 2em;
  height: 2em;
  border: 3px solid var(--color-cipher-lite);
  color: var(--color-cipher-lite);
  text-align: center;
  opacity: 0.5;
}

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
  grid-template-rows: calc(3em + 5vw) 3em 2fr 1fr 2em;
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

form .message {
  resize: none;
  margin: 0;
  padding: 0.5em;
  color: var(--color-font);
  background-color: var(--color-background);
  height: 100%;
  opacity: 0.8;
  font-size: x-large;
}

form > .history {
  display: flex;
  flex-flow: column-reverse;
  padding: 0.5em;
  overflow-y: auto;
  gap: 0.5em;
  border-left: 3px solid var(--color-cipher);
  transition-duration: 2000ms;
}

form.no-response-yet > .history {
  display: none;
}

form.no-response-yet > .trick-1 {
  grid-row: 3;
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
  word-wrap: break-word;
  max-width: 90%;
}

.history > .in.response {
  margin-left: 0.5em;
  color: var(--color-cipher);
  background-color: var(--color-cipher-lite);
  border-top-left-radius: 0;
  align-self: flex-start;
}

.history > .out.response {
  font-size: smaller;
  margin-right: 0.5em;
  color: var(--color-cipher-lite);
  background-color: var(--color-cipher);
  border-bottom-right-radius: 0;
  align-self: flex-end;
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
  if (state.messageText) {
    renderOutboundMessage(state.messageText)
    state.messageText = ""
  }
  messageDomElement.value?.focus()
}

function renderInboundMessage(message: string) {
  state.lastMessageReceived =
    `<div class="in response">${message}</div><br/>` + state.lastMessageReceived
  scrollToBottom()
}

function renderOutboundMessage(message: string) {
  state.lastMessageReceived =
    `<div class="out response">${state.messageText}</div><br/>` +
    state.lastMessageReceived
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
