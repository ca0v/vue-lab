<script setup lang="ts">
import {api1, api2} from "../services/fetch"

async function getData() {
  const data = await api1.getMyDatabase();
  return data;
}

const data = await getData();
</script>

<template>
  <h1>Main Template</h1>
  <!-- show each data item in a grid -->
  <div v-for="item in data" :key="item.id">
    <h2>{{item.id}}</h2>
    <p>There is no description for item {{item.id}} just yet.</p>
  </div>
</template>
