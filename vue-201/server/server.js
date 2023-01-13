const http = require("http")
const ws = require("ws")

const wss = new ws.Server({ noServer: true })

const listeners = {}

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
    message = message.toString()

    const header = message.substring(0, 15)

    if (listeners[header]) {
      listeners[header].forEach((listener) => listener.send(message))
    }

    // add self to listeners if not already there
    if (!listeners[header]) {
      listeners[header] = []
    }
    if (!listeners[header].includes(ws)) {
      listeners[header].push(ws)
    }
  })
}

http.createServer(accept).listen(8080)
