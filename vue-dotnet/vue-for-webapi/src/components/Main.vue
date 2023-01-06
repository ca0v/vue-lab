<script setup lang="ts">
import { reactive } from "vue";
import {api1 as api} from "../services/fetch"

async function getData() {
  const data = await api.getMyDatabase();
  if (!data.length) {
    data.push({id: -5}, {id: -7})
  }
  return data;
}

// set data into an observable model
const startupData = [{id: 1}, {id: 2}]
const reactiveData = reactive({startupData})
const data = reactiveData.startupData

async function loadData() {
  const data = await getData();
  console.log("loadData", {data})
  // eliminate any blank ids
  const dataWithKeys = data.filter(item => item.id).map(v => ({...v, id: v.id!}))
  reactiveData.startupData.push(...dataWithKeys)
}
</script>

<template>
  <h1>Main Template</h1>
  <div v-if="data.length === 0">
    <h2>No data</h2>
    <p>There is no data to show.</p>
  </div>
  <button v-on:click="() => loadData()">Load Data</button>
  <!-- show each data item in a grid -->
  <div v-for="item in data" :key="item.id">
    <h2>{{item.id}}</h2>
    <p>There is no description for item {{item.id}} just yet.</p>
  </div>
</template>
