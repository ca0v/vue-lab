<script setup lang="ts">
import Card from "./Card.vue";
import DocumentationIcon from "./icons/IconDocumentation.vue";
import ToolingIcon from "./icons/IconTooling.vue";
import EcosystemIcon from "./icons/IconEcosystem.vue";
import CommunityIcon from "./icons/IconCommunity.vue";
import SupportIcon from "./icons/IconSupport.vue";
</script>

<template>

<Card>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Documentation</template>

    Vue’s
    <a href="https://vuejs.org/" target="_blank" rel="noopener"
      >official documentation</a
    >
    provides you with all information you need to get started.
  </Card>

  <Card>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Components</template>
    A single-file component contains everything related to a component:
    <ul>
      <li>HTML template</li>
      <li>JavaScript logic</li>
      <li>Styles</li>
    </ul>

    There are two API's that can be used when creating a component:
    <ul>
      <li>
        <a href="https://vuejs.org/v2/guide/components.html" target="_blank"
          >Options API</a
        >
      </li>
      <li>
        <a href="https://v3.vuejs.org/guide/composition-api-introduction.html"
          target="_blank"
          >Composition API</a
        >
      </li>      
    </ul>

    <p>
      The Composition API is a new API that was introduced in Vue 3. It is
      recommended to use the Composition API when creating new components.
    </p>

    <p>Scripts are decorated with a "setup" attribute <code>&lt;script setup&gt;</code> tag.
      The <code>onMounted() method is one of the lifecycle hooks</code>
    </p>
    <p>The template is defined within the <code>&lt;template&gt;</code> tag</p>

  </Card>
</template>
