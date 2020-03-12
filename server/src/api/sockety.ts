import express from 'express'
import WebSocket from 'ws'
import { celebrate, Joi, Segments } from 'celebrate'

const Router = express.Router()

interface WebsocketRequest {
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'
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
  isAlive: boolean
  interval?: NodeJS.Timeout
  message?: WebsocketReturnRequest | undefined
}

interface TokenObject {
  token: string
}

const wss = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '8000') })
const clients: WebsocketClient[] = []

wss.on('connection', (ws: WebSocket, req) => {
  const client: WebsocketClient = {
    ws: ws,
    req: req,
    token: '',
    isAlive: true
  }

  client.ws.on('message', (message) => {
    const result: TokenObject | WebsocketReturnRequest | null = decodeString(message)

    if (!result || ((!(result as TokenObject).token || getClientByToken(clients, (result as TokenObject).token)) && !(result as WebsocketReturnRequest).data)) {
      return ws.terminate()
    }
    if ((result as WebsocketReturnRequest).data) {
      client.message = (result as WebsocketReturnRequest)
      return
    }
    client.token = (result as TokenObject).token
    clients.push(client)

    client.interval = setInterval(() => {
      if (client.isAlive === false) {
        return client.ws.terminate()
      }

      client.isAlive = false
      client.ws.ping(() => {
        console.log('ping')
      })
    }, 30000)

    client.ws.on('pong', () => {
      client.isAlive = true
    })

    client.ws.on('close', () => {
      client.isAlive = false
      if (client.interval) {
        clearInterval(client.interval)
      }
      deleteWebsocketClient(clients, client)
      console.log(`Connexion websocket from ${client.token} has been closed`)
    })
  })
})

Router.post('/', celebrate({
  [Segments.BODY]: Joi.object().keys({
    url: Joi.string().uri().required(),
    method: Joi.string().required(),
    headers: Joi.object(),
    body: Joi.object()
  }),
  [Segments.QUERY]: Joi.object().keys({
    token: Joi.string()
  }),
  [Segments.HEADERS]: Joi.object().keys({
    host: Joi.string(),
    authorization: Joi.string()
  }).unknown()
}), (req: express.Request, res: express.Response): express.Response<any> | null => {
  const request: WebsocketRequest = req.body
  const client = getClientByToken(clients, req.query.token) || getClientByToken(clients, (req.headers.authorization as string).replace(/^Bearer /gm, ''))

  if (!client || !client.ws) {
    return res.status(400).json({
      message: 'client not connected or invalid token'
    })
  }

  let stringifyRequest: string = ''
  try {
    stringifyRequest = JSON.stringify({
      method: request.method,
      url: request.url,
      header: JSON.stringify(request.headers),
      body: JSON.stringify(request.body)
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err })
  }

  const encodedRequest: string = Buffer.alloc(stringifyRequest.length, stringifyRequest).toString('base64')

  client.ws.send(encodedRequest, async (err: Error | undefined) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: err })
    }

    const message = await waitResponse(client).catch((err) => {
      console.error(err)
      return res.status(200).json({
        message: 'data sent to ' + client.req.connection.remoteAddress
      })
    })

    if (message) {
      client.message = undefined
      return res.status(200).json({
        message: 'data sent to ' + client.req.connection.remoteAddress,
        request: message
      })
    }
  })

  return null
})

const waitResponse = (client: WebsocketClient) => {
  return new Promise<WebsocketReturnRequest | null>((resolve, reject) => {
    const time = Date.now()
    const interval = setInterval(() => {
      if (time - Date.now() >= 1000) {
        clearInterval(interval)
        return reject(new Error('Reponse timeout'))
      }
      if (!client.message) {
        return
      }

      clearInterval(interval)
      return resolve(client.message)
    }, 10)
  })
}

const deleteWebsocketClient = (clients: WebsocketClient[], toDelete: WebsocketClient): void => {
  const index: number = clients.findIndex((client: WebsocketClient) => client.token === toDelete.token)
  if (index === -1) {
    return
  }
  clients.splice(index, 1)
}

const getClientByToken = (clients: WebsocketClient[], token: string): WebsocketClient | undefined => {
  return clients.find(client => client.token === token)
}

const decodeString = (message: string | WebSocket.Data): TokenObject | WebsocketReturnRequest | null => {
  if (!message) {
    return null
  }

  try {
    return (JSON.parse(Buffer.from(message.toString('base64'), 'base64').toString()))
  } catch (e) {
    console.error(e)
    return null
  }
}

export default Router
