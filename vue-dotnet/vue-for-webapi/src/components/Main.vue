<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { reactive } from "vue";
import {api1 as api} from "../services/fetch"
import type {components} from "../apiProxy"

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

refreshData();
</script>

<template>
  <h1>Main Template</h1>
  <div v-if="data.length === 0">
    <h2>No data</h2>
    <p>There is no data to show.</p>
  </div>
  <button v-on:click="() => refreshData()">Refresh Data</button>

  <!-- show each data item in a grid -->
  <div v-for="item in data" :key="item.id">
    <article>
      <p>{{item.name}}</p>
      <router-link :to="{name: 'Edit', params: {id: item.id}}">Edit {{ item.id }}</router-link>
    </article>
  </div>

</template>
