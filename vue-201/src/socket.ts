function promptFor(name: string) {
  let result = localStorage.getItem(name)
  if (result) return result
  result = prompt(name)
  if (result) {
    localStorage.setItem(name, result)
    return result
  }
  throw `no ${name} provided`
}

let SERVER =
  localStorage.getItem("server") || location.href.replace("http", "ws")

const listeners = [] as Array<(message: string) => void>

type ConnectionStatus = {
  socket: WebSocket
  isOpen: "opened" | "opening" | "closed"
}

function connect(onConnect: () => void): ConnectionStatus {
  let state: ConnectionStatus = {
    socket: new WebSocket(SERVER),
    isOpen: "closed",
  }

  state.socket.onopen = () => {
    state.isOpen = "opened"
    console.log("socket is open")

    state.socket.onmessage = (event) => {
      const message = event.data
      listeners.forEach((callback) => callback(message))
    }

    state.socket.onclose = () => {
      state.isOpen = "closed"
      console.log("socket is closed")
    }

    state.socket.onerror = (error) => {
      console.log("socket error", error)
      SERVER = promptFor("server")
    }

    onConnect()
  }

  return state
}

let socket: ConnectionStatus | null = null

function send(message: string) {
  if (!socket || socket.isOpen == "closed") {
    socket = connect(() => send(message))
    return
  }
  if (socket.isOpen == "opening") {
    console.log("still trying to connect")
    return
  }
  socket.socket.send(message)
}

function listen(callback: (message: string) => void) {
  listeners.push(callback)
}

export { send, listen }
