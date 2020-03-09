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
  token: string
}

interface TokenObject {
  token: string
}

let client: WebsocketClient

wss.on('connection', (ws: WebSocket, req) => {
  client = {
    ws: ws,
    req: req,
    token: ''
  }

  client.ws.on('message', (message) => {
    let result: TokenObject | WebsocketReturnRequest | null

    try {
      const str = Buffer.from(message.toString('base64'), 'base64').toString()
      result = JSON.parse(str)
      if (result === null) {
        client.ws.terminate()
      } else if ((result as TokenObject).token) {
        client.token = (result as TokenObject).token
      } else {
      }
    } catch (e) {
      result = null
      console.log(e)
    }
  })
})

Router.post('/', (req: express.Request, res: express.Response): express.Response<any> | null => {
  const request: WebsocketRequest = req.body
  const { token } = req.query

  if (!request.url || !request.method || !client || !client.ws) {
    console.log('empty parameter')
    return res.status(500).json({
      message: 'empty parameter'
    })
  }

  if (token !== client.token) {
    console.log('bad token')
    return res.status(500).json({
      message: 'invalid token'
    })
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
