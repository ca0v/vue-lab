<script setup lang="ts">

import { ref, reactive, watchEffect } from "vue";
import {RouterLink, useRoute} from "vue-router"
import type { components } from '@/apiProxy';
import {api1 as api } from "../services/fetch"
import { debounce } from "@/fun/debounce";

const data = reactive({data: [] as components["schemas"]["Title"][]})

// read the data from the route
console.log("useRoute", {...useRoute()});

const searchText = ref("")

async function search(query: string) {
    console.log("search", query)
    if (!query) return
    const response = await api.searchForMovie(query)
    console.log("search", query, response)
    data.data = response
}

// create a debounced version of search
const debouncedSearch = debounce(search, 500)

// when searchText changes, do a search
watchEffect(() => debouncedSearch(searchText.value))

</script>

<template>
    <h1>Search for a Movie</h1>
    <input v-model="searchText" />
    <div v-if="data.data.length === 0">
        <h2>No data</h2>
        <p>There is no data to show.</p>
    </div>
    <div v-for="item in data.data" :key="item.titleId!">
        <article>
            <p>{{item.primaryTitle}}</p>
            <router-link :to="{name: 'MovieView', params: {id: item.titleId}}">Details</router-link>
        </article>
    </div>
</template>