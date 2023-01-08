<script setup lang="ts">
import Main from "./components/Main.vue"
import { KeepAlive } from "vue"
</script>

<template>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped></style>
