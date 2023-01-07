<script setup lang="ts">
import { reactive } from "vue";
import {api1 as api} from "../services/fetch"
import type {components} from "../ApiProxy"

async function getData() {
  const data = await api.getMyDatabase();
  return data;
}

// set data into an observable model
const startupData: Array<components["schemas"]["MyTable"]> = []
const reactiveData = reactive({startupData})
const data = reactiveData.startupData

async function refreshData() {
  const data = await getData();
  // the proxy gen is not perfect, so we need to cast the data
 const dataWithKeys = data as components["schemas"]["MyTable"][] & {id: number};
 reactiveData.startupData.length = 0;
  reactiveData.startupData.push(...dataWithKeys)
}
</script>

<template>
  <h1>Main Template</h1>
  <div v-if="data.length === 0">
    <h2>No data</h2>
    <p>There is no data to show.</p>
  </div>
  <button v-on:click="() => refreshData()">Load Data</button>
  <!-- show each data item in a grid -->
  <div v-for="item in data" :key="item.id">
    <h2>{{item.id}}</h2>
    <p>{{item.name}}</p>
  </div>
</template>
