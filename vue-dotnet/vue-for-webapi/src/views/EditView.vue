<script setup lang="ts">

import {useRoute} from "vue-router"
import type { components } from '@/apiProxy';
import {api1 as api } from "../services/fetch"

// read the data from the route
console.log("useRoute", {...useRoute()});

const itemId = useRoute().params.id as string

// save the data
async function save(item: components["schemas"]["MyTable"]) {
    await api.updateMyDatabase(item)
}

</script>

<template>
    <h1>Editing Item: {{itemId || "?"}}</h1>
</template>