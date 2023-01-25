<script lang="ts">
  import LogoButton from "./LogoButton.svelte"
  import FR from "./FR.svelte"
  import Toaster from "./toaster.svelte"
  import { proposeToast } from "../store/messaging"

  let showFreightRatesPage: boolean

  function open(route: string) {
    console.log("open", route)
    // create a new activePage
    switch (route) {
      case "/fr":
        console.log("open freight rates")
        // add a FR element to the main element
        showFreightRatesPage = !showFreightRatesPage
        break
    }
  }
</script>

<svelte:window
  on:unhandledrejection={(event) =>
    proposeToast(`UNHANDLED EXCEPTION: ${event.reason}`, 5, { error: true })}
/>

<div class="flex">
  <nav>
    <LogoButton title="ASIN Exclusion List" element_id="" disabled />
    <LogoButton
      title="Freight Rates"
      element_id=""
      on:click={() => open("/fr")}
    />
  </nav>
  <br />
  <main>
    <slot />
    {#if showFreightRatesPage}
      <svelte:component this={FR} />
    {/if}
  </main>
  <div class="toaster">
    <Toaster />
  </div>
</div>

<style>
  .flex {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  nav {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, clamp(8em, 20vw, 12em));
    gap: 1em;
    /* center items */
    justify-content: center;
  }

  main {
    width: 100%;
    height: auto;
    border-radius: var(--radius);
  }

  .toaster {
    /* stick to the bottom left of screen */
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1000;
    /* allow click-through */
    pointer-events: none;
  }
</style>
