<script lang="ts">
  import { messages, proposeToast } from "../store/messaging"
  proposeToast("Hello world!!", 1)
  proposeToast("Oh No!!", 10, { error: true })
</script>

<div>
  <div class="toaster" class:hidden={!$messages.length}>
    <div class="toaster_content">
      {#each $messages as message}
        <div class="toaster_message" class:error={message.type === "error"}>
          {message.message}
        </div>
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
    transition: all 0.5s ease-in-out;
    opacity: 1;
    border-top-right-radius: var(--radius);
    border: 1px solid var(--color-gray-50);
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

  .toaster_message {
    color: var(--color-gray-100);
  }

  .toaster_message.error {
    color: var(--color-red-50);
  }
  
</style>
