<script lang="ts">
  import LogoButton from "./LogoButton.svelte"
  import FR from "./FR.svelte"

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

<div class="flex">
  <h1>Ecommerce Tracking Maintenance</h1>
  <nav>
    <LogoButton title="ASIN Exclusion List" element_id="XL" />
    <LogoButton
      title="Freight Rates"
      element_id="FR"
      on:click={() => open("/fr")}
    />
    <LogoButton title="Shipping Zones" element_id="SZ" />
  </nav>
  <main>
    <slot />
    {#if showFreightRatesPage}
      <svelte:component this={FR} />
    {/if}
  </main>
</div>

<style>
  .flex {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    text-align: center;
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
    border: 1px solid var(--border-color);
    width: 100%;
    height: auto;
    border-radius: var(--radius);
  }
</style>
