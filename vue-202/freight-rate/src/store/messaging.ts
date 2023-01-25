import {writable} from 'svelte/store'

export let messages = writable<Array<{ message: string; lifetime: number }>>([])

export function proposeToast(message: string, lifetime = 5) {
  const key = { message, lifetime }
  messages.update((messages) => [...messages, key])
  setTimeout(() => {
    messages.update((messages) => messages.filter((m) => m !== key))
  }, lifetime * 1000)
}
