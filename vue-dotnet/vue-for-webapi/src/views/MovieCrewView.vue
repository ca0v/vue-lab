<script setup lang="ts">
import { reactive } from "vue"
import { useRoute } from "vue-router"
import type { components } from "@/apiProxy"
import { api1 as api } from "../services/fetch"

const data = reactive({
  data: null as Array<components["schemas"]["Crew"]> | null,
})

// read the data from the route
console.log("useRoute", { ...useRoute() })

const titleId = useRoute().params.id as string

async function search() {
  console.log("search", titleId)
  const response = await api.getCrew(titleId)
  data.data = response
}
search()
</script>

<template>
  <section v-if="data.data">
    <article class="flex">
      <u>Person</u>
      <u>Characters</u>
      <u>Category</u>
      <template v-for="item in data.data" :key="item.personId!">
        <b>{{ item.person?.name || "?" }}</b>
        <p>{{ JSON.parse(item.characters!)?.join(",") }}</p>
        <p>{{ item.category }}</p>
      </template>
    </article>
  </section>
  <section v-else>No information found.</section>
</template>

<style>
.flex {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}
</style>
