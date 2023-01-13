let isOpen = false

const listeners = [] as Array<(message: string) => void>

function connect() {
  let socket = new WebSocket("ws://localhost:8080")

  socket.onopen = () => {
    isOpen = true
    console.log("socket is open")

    socket.onmessage = (event) => {
      const message = event.data
      console.log("onmessage", message)
      listeners.forEach((callback) => callback(message))
    }

    socket.onclose = () => {
      isOpen = false
    }

    socket.onerror = (error) => {
      console.log("socket error", error)
    }
  }

  return socket
}

let socket = connect()
function send(message: string) {
  if (!isOpen) {
    console.log("socket is not open")
    socket = connect()
  }
  socket.send(message)
}

function listen(callback: (message: string) => void) {
  listeners.push(callback)
}

export { send, listen }
