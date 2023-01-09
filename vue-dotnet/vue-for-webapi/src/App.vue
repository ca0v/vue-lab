<script setup lang="ts">
import Main from "./components/Main.vue"
import { KeepAlive } from "vue"
import MovieSearchView from "./views/MovieSearchView.vue";
</script>

<template>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive include="MovieSearchView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped>

</style>
