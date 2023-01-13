<template>
  <main>
    <form>
      <input
        ref="wordDomElement"
        type="text"
        v-model="state.threeWords"
        placeholder="[Any three words]"
      />
      <textarea
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
}

form > textarea {
  resize: none;
  height: calc(100vh - 20em);
}

form > button {
  background-color: #122c4c;
}
</style>

<script setup lang="ts">
import { listen as listenToServer, send as sendToServer } from "./socket"
import { reactive, ref } from "vue"

const state = reactive({
  messageText: "It is not going to help",
  threeWords: "Which WayIs Westward",
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
  console.log({ decrypted, result })
  return result
}

listenToServer((message: string) => {
  console.log("rcvd", decrypt(state.threeWords, message))
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
</script>
