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
  clientID: string
  isAlive: boolean
  interval?: NodeJS.Timeout
  message?: WebsocketReturnRequest | undefined
}

interface ClientIDObject {
  clientID: string
}

const wss = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '8000') })
const clients: WebsocketClient[] = []

wss.on('connection', (ws: WebSocket, req) => {
  const client: WebsocketClient = {
    ws: ws,
    req: req,
    clientID: '',
    isAlive: true
  }

  client.ws.on('message', (message) => {
    const result: ClientIDObject | WebsocketReturnRequest | null = decodeString(message)

    if (!result || ((!(result as ClientIDObject).clientID || getClientByClientID(clients, (result as ClientIDObject).clientID)) && !(result as WebsocketReturnRequest).data)) {
      return ws.terminate()
    }
    if ((result as WebsocketReturnRequest).data) {
      client.message = (result as WebsocketReturnRequest)
      return
    }
    client.clientID = (result as ClientIDObject).clientID
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
      console.log(`Connexion websocket from ${client.clientID} has been closed`)
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
    client_id: Joi.string()
  })
}), (req: express.Request, res: express.Response, next: express.NextFunction): express.Response<any> | null => {
  const request: WebsocketRequest = req.body
  const client = getClientByClientID(clients, req.query.client_id)

  if (!client || !client.ws) {
    return res.status(400).json({
      message: 'client not connected or invalid client ID'
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

    const remoteAddress: string = client.req.connection.remoteAddress.replace(/::ffff:/gm, '')

    const message = await waitResponse(client).catch((err) => {
      console.error(err)
      res.status(200).json({
        message: `data sent to ${remoteAddress}`
      })
    })

    if (message) {
      client.message = undefined
      return res.status(200).json({
        message: `data sent to ${remoteAddress}`,
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
      console.log(time - Date.now())
      if (Date.now() - time >= 1000) {
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
  const index: number = clients.findIndex((client: WebsocketClient) => client.clientID === toDelete.clientID)
  if (index === -1) {
    return
  }
  clients.splice(index, 1)
}

const getClientByClientID = (clients: WebsocketClient[], clientID: string): WebsocketClient | undefined => {
  return clients.find(client => client.clientID === clientID)
}

const decodeString = (message: string | WebSocket.Data): ClientIDObject | WebsocketReturnRequest | null => {
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
