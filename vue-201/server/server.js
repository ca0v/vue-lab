const https = require("https")
const ws = require("ws")

const wss = new ws.Server({ noServer: true })

const listeners = {}
const messageQueue = {}

function accept(req, res) {
  console.log("accept")
  if (req.headers.upgrade?.toLowerCase() != "websocket") {
    res.end()
    return
  }

  // can be Connection: keep-alive, Upgrade
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    res.end()
    return
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect)
}

function onConnect(ws) {
  console.log("onConnect")
  // get the ip of the client
  const ip = ws._socket.remoteAddress
  console.log(ip)

  ws.on("message", function (message) {
    console.log("message received")
    message = message.toString()

    const header = message.substring(0, 15)

    // add self to listeners if not already there
    listeners[header] = listeners[header] || []
    if (!listeners[header].includes(ws)) {
      listeners[header].push(ws)
      console.log("any messages queued for this header?")
      if (messageQueue[header]) {
        messageQueue[header].forEach((message) => ws.send(message))
        messageQueue[header] = []
        console.log("no other users will see these messages")
      }
    }

    const otherClients = listeners[header].filter((listener) => listener !== ws)
    if (otherClients.length) {
      console.log(
        `${otherClients.length} client(s) already here, sending message`
      )
      otherClients.forEach((l) => message && l.send(message))
    } else {
      console.log("no one is listening, queue the message")
      ;(messageQueue[header] = messageQueue[header] || []).push(message)
    }
  })

  ws.on("close", () => {
    // remove self from listeners
    Object.keys(listeners).forEach((header) => {
      listeners[header] = listeners[header].filter(
        (listener) => listener !== ws
      )
    })
  })
}

https.createServer(accept).listen(8080)
