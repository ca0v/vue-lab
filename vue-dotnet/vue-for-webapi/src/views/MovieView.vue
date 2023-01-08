<script setup lang="ts">

import { ref, reactive } from "vue";
import {useRoute} from "vue-router"
import type { components } from '@/apiProxy';
import {api1 as api } from "../services/fetch"

const data = reactive({data: null as components["schemas"]["Title"]|null})

// read the data from the route
console.log("useRoute", {...useRoute()});

const titleId = useRoute().params.id as string

async function search() {
    console.log("search", titleId)
    const response = await api.getMovie(titleId)
    data.data = response
}
search()
</script>

<template>
    <section v-if=data.data>
        <h1>Movie Information</h1>
        <h2>{{ data.data.originalTitle }}</h2>
        <div>{{ data.data.type }} Premiered {{ data.data.premiered }}</div>
        <div>{{ data.data.ended }}</div>
        <div>{{ data.data.runtimeMinutes }}</div>
    </section>
    <section v-else>
        No information found.
    </section>
</template>