<script setup lang="ts">
import { ref, reactive } from "vue"
import { RouterLink, useRoute } from "vue-router"
import type { components } from "@/apiProxy"
import { api1 as api } from "../services/fetch"
import MovieCastView from "./MovieCrewView.vue"

const data = reactive({ data: null as components["schemas"]["Title"] | null })

// read the data from the route
console.log("useRoute", { ...useRoute() })

const titleId = useRoute().params.id as string

async function search() {
  console.log("search", titleId)
  const response = await api.getMovie(titleId)
  data.data = response
}
search()
</script>

<template>
  <section v-if="data.data">
    <h1><i>{{ data.data.originalTitle }}</i> {{ data.data.premiered }}</h1>
    <span>
      {{ data.data.type }} 
      ended {{ data.data.ended }}
      runtime: {{ data.data.runtimeMinutes }}</span>
    <h3>Cast of <q>{{ data.data.primaryTitle }}</q></h3>
    <MovieCastView></MovieCastView>
  </section>
  <section v-else>No information found.</section>
</template>
