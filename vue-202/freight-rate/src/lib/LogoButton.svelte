<script lang="ts">
  import { createEventDispatcher } from "svelte"
  export let title: string
  export let element_id: string

  const dispatch = createEventDispatcher()

  function click() {
    console.log(`Clicked ${element_id}`)
    // trigger global event
    dispatch("click", element_id)
  }
</script>

<button on:click={click}>
  <div class="logo">{element_id}</div>
  <span>{title}</span>
</button>

<style>
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 8em;
    height: 8em;
    background-color: var(--primary-color);
    padding: 1em;
  }

  button > .logo {
    width: 3em;
    height: 3em;
    line-height: 3em;
    font-size: 1em;
    margin: 0.5em;
  }

  button > .logo:hover {
    background-color: var(--secondary-color);
    border-color: var(--primary-color);
    font-weight: bolder;
  }
</style>
