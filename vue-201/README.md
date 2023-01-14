# Vue-201

This is the scaffolded project and I was going to customize it but I think I fully understand Vue 3 with respect to this startup project.

1. index.html greets the user, loads the bootstrapping script, main.ts

2. The bootstrapper initializes App.vue

3. App.vue is a root component with &lt;router-link&gt;'s to the Home and About components.

4. The routes are defined such that the About component is lazy loaded

5. There is no state management and no data binding on this page.  There are no vitests.

## Adaptation Ideas

* Using local storage, create a TODO app
* Creating a "Secure" chat app that uses a simple xor encoder to jiggle the message a few bits.
* This will be an express server that also serves WebSocket on the same port.
* Use-case: as usual, none, maybe give my son a direct line to me
