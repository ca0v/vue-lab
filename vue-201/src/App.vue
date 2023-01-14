<template>
  <main>
    <form :class="!state.lastMessageReceived ? 'no-response-yet' : ''">
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
      >
      </textarea>
      <button
        :disabled="!state.messageText"
        type="submit"
        @click.prevent="send"
      >
        Send
      </button>
    </form>
    <router-view></router-view>
  </main>
</template>

<style>
main {
  color: var(--color-cipher-lite);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

form {
  width: 80vw;
  height: calc(100vh - 10em);
  display: grid;
  gap: 1em;
  grid-template-rows: 3em auto 10em 5em;
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

form.no-response-yet > .message {
  grid-row: span 2;
}

form > button {
  background-color: var(--color-cipher);
}

.response {
  display: inline-block;
  padding: 0.5em;
  outline: 1px solid #fff5;
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
import { onBeforeMount, reactive, ref } from "vue"
import { decrypt, encrypt } from "./crypt"

const state = reactive({
  messageText: "",
  threeWords: "",
  lastMessageReceived: "",
})

const wordDomElement = ref<HTMLInputElement | null>(null)
const messageDomElement = ref<HTMLTextAreaElement | null>(null)

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
  if (words.join().length < 15) {
    console.log("Please enter longer words")
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

onBeforeMount(() => {
  const threeWords = localStorage.getItem("threeWords")
  if (threeWords) {
    state.threeWords = threeWords
  }
})
</script>