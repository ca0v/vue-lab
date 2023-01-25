import { writable } from "svelte/store"

export let messages = writable<
  Array<{ message: string; lifetime: number; type: string }>
>([])

function proposeToast(
  message: string,
  options?: { error?: boolean; lifetime?: number }
): void {
  const type = options?.error ? "error" : "info"
  const lifetime = options?.lifetime || (options?.error ? 10 : 5)
  const key = { message, lifetime, type }
  messages.update((messages) => [...messages, key])
  setTimeout(() => {
    messages.update((messages) => messages.filter((m) => m !== key))
  }, lifetime * 1000)
}

export { proposeToast }
