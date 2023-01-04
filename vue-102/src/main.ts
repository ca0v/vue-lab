/**
 * This file is the entry point for the application.
 * In Vue, it is called the "mount container".
 * I would call the #app node is the mount container,
 * but that is called the "root component instance".
 * The #app node is defined in the ./index.html file.
 * The "mount" returns the root component instance.
 * In this case, that component (App) defines a <template>, so that is what is rendered.
 */
import { createApp } from "vue";
import { createPinia } from "pinia";

// this is the root view (component + template)
import App from "./App.vue";

// this defines the routes, navigate to app components starting here
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

// "The Vue Store that you will enjoy using"
app.use(createPinia());
app.use(router);

const rootComponentInstance = app.mount("#app");
console.log({ rootComponentInstance });
rootComponentInstance.$.emit("eventName", "eventData");

app.provide("injectKey", "injectValue");
// from inside a component, the inject("injectKey") returns "injectValue"
