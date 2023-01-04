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
    <template #heading>Application</template>
    <p>The application is the root component and is mounted from outside the framework with <code>app.mount('#app')</code></p>
    <br/>
    <p>The <code>mount()</code> return value is a DOM element, which seems natural, since we are outside the framework (or inside the mount container).</p>
    <br/>
    <p>The mount container is also the root component and also be the root view.  Either the innerHTML or the &lt;template&gt; defines the template.</p>
    <br/>
    <p>Recall that view = component + template.</p>
    <br/>
    <p>Application = Root Component + Root Template = Root View</p>
    <br/>
    <p>The greater application, let's call it a workspace, can have multiple applications.  For Vue, the workspace is mount container.</p>
    <br/>
    <p>Mount Container can contain multiple apps</p>
    <br/>
    <p>Presumably an App should have a single purpose</p>
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

  <Card>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Templates</template>
    <p>Templates are the HTML markup that is rendered by the browser.</p>
    <br/>
    <p>Templates are defined within the <code>&lt;template&gt;</code> tag</p>
    <br/>
    <p>Templates use double-curly brackets (mustache) within the body of an element but for attributes you must use <code>v-bind:<i>attr</i></code></p>
    <br/>
    <p>Both are used to define a data-binding</p>
    <br/>
    <p>You don't need to type <code>v-bind</code> as the shorthand is simply <code>:<i>attr</i></code></p>
    <br/>
    <p>Similarly, <code>v-on:click</code> can be written as <code>@click</code></p>
    <br/>
    <p>If it gets ugly, use a computed property (reactive)</p>
    <br/>
    <p>There are modifiers as well (submit.prevent) and presumable <i>once</i></p>
  </Card>

  <Card>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Reactive</template>
    <p>The <code>reactive({a:1})</code> does not work on primitives.  For that use <code>ref(1)</code>.  This is what makes Vue a reactive framework.</p>
  </Card>


  <Card>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Computed Properties</template>
    <p>Computed properties cache there value so they don't fire unnecessarily.</p>
    <p>You can define a setter to make a computed property writable</p>
  </Card>
  
</template>
