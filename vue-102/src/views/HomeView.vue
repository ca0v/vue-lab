<!-- 
  This is an example of an application component, similar to App, but not a root component. 
  Notice we are within the "view" folder, and not the "components" folder.
  What makes this a view is that it is a component that is used as a template for a route.
-->
<script setup lang="ts">
import Glossary from "../components/Glossary.vue";
</script>

<template>
  <main>
    <Glossary />
  </main>
</template>
