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
  {#if element_id}
    <div class="logo">{element_id}</div>
    <span>{title}</span>
  {:else}
    <span class="fill">{title}</span>
  {/if}
</button>

<style>
  button {
    display: grid;
    grid-template-rows: 1fr;
    /* center */
    justify-items: center;
    align-items: center;
    max-width: 12em;
    max-height: 8em;
    padding: 1em;
  }

  button:has(.logo) {
    grid-template-rows: 1fr 2fr;
  }

  button > .logo {
    width: 3em;
    height: 3em;
    line-height: 3em;
    font-size: 1em;
    margin: 0.5em;
    border: none;
  }

  button:focus > .logo,
  button:hover > .logo {
    background-color: var(--secondary-color);
    border-color: var(--border-color-dark);
    font-weight: bolder;
  }

  button > span {
    font-size: smaller;
    font-weight: bolder;
  }

  button > span.fill {
    font-size: 1em;
  }
</style>
