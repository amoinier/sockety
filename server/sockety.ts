import express from 'express'
import WebSocket from 'ws'

const Router = express.Router()

const wss = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '80') })

interface WebsocketRequest {
  method: string
  url: string
  header: string
  body: string
}

let globalWs: WebSocket

wss.on('connection', (ws) => {
  globalWs = ws

  globalWs.on('message', (message) => {
    console.log('received: %s', message)
  })

  globalWs.send('something')
})

Router.post('/', (req: express.Request, res: express.Response): express.Response<any> => {
  const request: WebsocketRequest = req.body

  if (!request.url || !request.method || !globalWs) {
    return res.sendStatus(500).json()
  }

  // request.header = Buffer.alloc(request.header.length, request.header, 'base64').toString('ascii')
  // request.body = Buffer.alloc(request.body.length, request.body, 'base64').toString('ascii')

  let stringifyRequest: string = ''
  try {
    stringifyRequest = JSON.stringify(request)
  } catch (e) {
    console.log(e)
  }

  const encodedRequest: string = Buffer.alloc(stringifyRequest.length, stringifyRequest).toString('base64')

  globalWs.send(encodedRequest)

  return res.sendStatus(200).json()
})

export default Router
