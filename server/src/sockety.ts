import express from 'express'
import WebSocket from 'ws'

const Router = express.Router()

const wss = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '80') })

interface WebsocketRequest {
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH' | 'link' | 'LINK' | 'unlink' | 'UNLINK' | undefined
  url: string
  headers: object
  body: object
}

interface WebsocketReturnRequest {
  status: number
  data: object | string
}

interface WebsocketClient {
  ws: WebSocket
  req: any
}

let client: WebsocketClient

wss.on('connection', (ws: WebSocket, req) => {
  client = {
    ws: ws,
    req: req
  }

  client.ws.on('message', (message) => {
    let result: WebsocketReturnRequest | null

    try {
      const str = Buffer.from(message.toString('base64'), 'base64').toString()
      result = JSON.parse(str)
      if (result !== null && result.data) {
        result.data = JSON.parse(result.data as string)
      }
    } catch (e) {
      result = null
      console.log(e)
    }
  })

  client.ws.send('something')
})

Router.post('/', (req: express.Request, res: express.Response): express.Response<any> | null => {
  const request: WebsocketRequest = req.body

  if (!request.url || !request.method || !client || !client.ws) {
    console.log('empty parameter')
    return res.status(500).json()
  }

  let stringifyHeader: string = ''
  let stringifyBody: string = ''
  let stringifyRequest: string = ''
  try {
    stringifyHeader = JSON.stringify(request.headers)
    stringifyBody = JSON.stringify(request.body)
    stringifyRequest = JSON.stringify({
      method: request.method,
      url: request.url,
      header: stringifyHeader,
      body: stringifyBody
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: err })
  }

  const encodedRequest: string = Buffer.alloc(stringifyRequest.length, stringifyRequest).toString('base64')

  client.ws.send(encodedRequest, (err) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ error: err })
    }

    return res.status(200).json({
      message: 'data sent to ' + client.req.connection.remoteAddress
    })
  })

  return null
})

export default Router
