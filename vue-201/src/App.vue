<template>
  <main>
    <form :class="!state.lastMessageReceived ? 'no-response-yet' : ''">
      <input
        ref="wordDomElement"
        type="text"
        v-model="state.threeWords"
        placeholder="[Any three words]"
      />
      <textarea
        class="history"
        readonly
        :value="state.lastMessageReceived"
      ></textarea>
      <textarea
        class="message"
        v-model="state.messageText"
        placeholder="[ENTER YOU MESSAGE]"
      ></textarea>
      <button type="submit" @click.prevent="send">Send</button>
    </form>
    <router-view></router-view>
  </main>
</template>

<style>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

form {
  width: 80vw;
  height: calc(100vh - 20em);
  display: grid;
  grid-template-rows: 1fr 8fr 4fr;
}

form > textarea {
  resize: none;
}

form.no-response-yet > .history {
  display: none;
}

form.no-response-yet > .message {
  grid-row: span 2;
}

form > button {
  background-color: #122c4c;
}
</style>

<script setup lang="ts">
import { listen as listenToServer, send as sendToServer } from "./socket"
import { onBeforeMount, reactive, ref } from "vue"

const state = reactive({
  messageText: "It is not going to help",
  threeWords: "Which WayIs Westward",
  lastMessageReceived: "",
})

const wordDomElement = ref<HTMLInputElement | null>(null)

function encrypt(key: string, message: string) {
  // apply additive cipher
  const encrypted = (key + message)
    .split("")
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) + key.charCodeAt(i % key.length))
    )
    .join("")
  return encrypted
}

// reverse the additive cipher
function decrypt(key: string, message: string) {
  const decrypted = message
    .split("")
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - key.charCodeAt(i % key.length))
    )
    .join("")
  const result = decrypted.substring(key.length)
  return result
}

listenToServer((message: string) => {
  // persist the key
  localStorage.setItem("threeWords", state.threeWords)
  state.lastMessageReceived += decrypt(state.threeWords, message) + "\n"
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
  state.messageText = ""
}

onBeforeMount(() => {
  const threeWords = localStorage.getItem("threeWords")
  if (threeWords) {
    state.threeWords = threeWords
  }
})
</script>
