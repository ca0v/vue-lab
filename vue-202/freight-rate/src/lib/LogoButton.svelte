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
    max-width: 12em;
    max-height: 8em;
    padding: 1em;
  }

  button > .logo {
    width: 3em;
    height: 3em;
    line-height: 3em;
    font-size: 1em;
    margin: 0.5em;
  }

  button:focus > .logo,
  button:hover > .logo {
    background-color: var(--secondary-color);
    border-color: var(--primary-color);
    font-weight: bolder;
  }
</style>
