<script setup lang="ts">
import {inject} from "vue";
</script>

<template>
  <div class="about">
    <h1>Vue Lab</h1>
    <p>Summary documentation on the fundamental elements of Vue</p>
    <br/>
    <p>The <code>injectKey</code> value is <code>{{inject("injectKey")}}</code></p>    
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
