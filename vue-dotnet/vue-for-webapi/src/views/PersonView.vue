<script setup lang="ts">
import { reactive } from "vue"
import { useRoute } from "vue-router"
import type { components } from "@/apiProxy"
import { api1 as api } from "../services/fetch"

const data = reactive({
  movies: null as Array<components["schemas"]["Title"]> | null,
  person: null as components["schemas"]["Person"] | null,
})

const personId = useRoute().params.id as string

async function search() {
  const response = await api.getPerson(personId)
  data.person = response
}
search()

async function getMovies() {
  const response = await api.getPersonMovies(personId)
  data.movies = response
}
getMovies()

</script>

<template>
  <section v-if="data.person">
    <h1>
      <i>{{ data.person.name }}</i>
    </h1>
    <span>born {{ data.person.born }}</span>
    <span>died {{ data.person.died }}</span>
  </section>
  <section v-else>No information found.</section>
  <section v-if="data.movies">
    <h2>Movies</h2>
    <ul>
      <li v-for="movie in data.movies" :key="movie.titleId!">
        <router-link :to="`/movies/${movie.titleId}`">{{
          movie.primaryTitle
        }}</router-link>
      </li>
    </ul>
  </section>
  <section v-else>No movies found.</section>
</template>

<style>
section {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1rem;
  /* center items */
  justify-items: center;
}
</style>
