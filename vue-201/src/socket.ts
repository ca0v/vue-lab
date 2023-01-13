let isOpen = false

const listeners = [] as Array<(message: string) => void>

function connect() {
  let socket = new WebSocket("ws://localhost:8080")

  socket.onopen = () => {
    isOpen = true
    console.log("socket is open")

    socket.onmessage = (event) => {
      const message = event.data
      listeners.forEach((callback) => callback(message))
    }

    socket.onclose = () => {
      isOpen = false
      console.log("socket is closed")
    }

    socket.onerror = (error) => {
      console.log("socket error", error)
    }
  }

  return socket
}

let socket: WebSocket | null = null
function send(message: string) {
  if (!isOpen || !socket) {
    socket = connect()
    setTimeout(() => send(message), 100);
  }
  socket.send(message)
}

function listen(callback: (message: string) => void) {
  listeners.push(callback)
}

export { send, listen }
