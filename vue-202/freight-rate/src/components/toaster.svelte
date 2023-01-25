<script lang="ts">
  import { messages, proposeToast } from "../store/messaging"
  proposeToast("Hello world!!", 1)
</script>

<div>
  <div class="toaster" class:hidden={!$messages.length}>
    <div class="toaster_content">
      {#each $messages as message}
        <div class="toaster_message">{message.message}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .toaster {
    background-color: var(--color-gray-10);
    width: 20rem;
    height: auto;
    padding: 1rem;
    margin: 0.5rem;
    transition: all 0.5s ease-in-out;
    opacity: 1;
  }

  .toaster_content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hidden {
    opacity: 0;
    width: 0;
  }
</style>
