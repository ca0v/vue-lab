import { writable } from "svelte/store"

export let messages = writable<Array<{ message: string; lifetime: number, type: string }>>([])

function proposeToast(
  message: string,
  lifetime = 5,
  options?: { error: boolean }
): void {
  const type = options?.error ? "error" : "info"
  const key = { message, lifetime, type }
  messages.update((messages) => [...messages, key])
  setTimeout(() => {
    messages.update((messages) => messages.filter((m) => m !== key))
  }, lifetime * 1000)
}

export { proposeToast }
