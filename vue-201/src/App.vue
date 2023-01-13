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
  messageText: "",
  threeWords: "",
})

const wordDomElement = ref<HTMLInputElement | null>(null)

function encrypt(keys: string[], message: string) {
  const key = keys.join(" ")
  // apply additive cipher
  const encrypted = message
    .split("")
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) + key.charCodeAt(i % key.length))
    )
    .join("")
  return encrypted
}

// reverse the additive cipher
function decrypt(keys: string[], message: string) {
  const key = keys.join(" ")
  const decrypted = message
    .split("")
    .map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) - key.charCodeAt(i % key.length))
    )
    .join("")
  return decrypted
}

listenToServer((message: string) => {
  console.log("listenToServer")
  const words = state.threeWords.split(" ")
  console.log("listenToServer", decrypt(words, message))
})

const send = () => {
  const words = state.threeWords.split(" ")
  if (words.length !== 3) {
    console.log("Please enter three words")
    console.log("wordDomElement", wordDomElement.value ?? "none")
    wordDomElement.value?.focus()
    return
  }

  const message = encrypt(words, state.messageText)

  console.log("sending", message)
  console.log("sending", decrypt(words, message))
  // trigger change on messageText
  state.messageText = ""
  sendToServer(message)
}
</script>
