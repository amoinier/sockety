import express from 'express'
import WebSocket from 'ws'
import { celebrate, Joi, Segments } from 'celebrate'
import { v4 as uuidv4 } from 'uuid'

const Router = express.Router()

interface WebsocketRequest {
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'
  url: string
  headers: object
  body: object
}

interface WebsocketReturnRequest {
  uuid: string
  status: number
  data: object | string
}

interface ClientIDObject {
  clientID: string
}

interface WebsocketClient extends ClientIDObject {
  ws: WebSocket
  req: any
  isAlive: boolean
  interval?: NodeJS.Timeout
  message: {
    [messageID: string]: object
  }
}

const wss = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '8000') })
const clients: WebsocketClient[] = []

wss.on('connection', (ws: WebSocket, req) => {
  const client: WebsocketClient = {
    ws: ws,
    req: req,
    clientID: '',
    isAlive: true,
    message: {}
  }

  client.ws.on('message', (message) => {
    const wsMessage: ClientIDObject | WebsocketReturnRequest | null = decodeString(message)

    if (!wsMessage) {
      console.error('wsMessage is null')
      return ws.terminate()
    }
    if ((wsMessage as ClientIDObject).clientID) {
      client.clientID = (wsMessage as ClientIDObject).clientID
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
    }
    if ((wsMessage as WebsocketReturnRequest).uuid) {
      client.message[(wsMessage as WebsocketReturnRequest).uuid] = {
        status: (wsMessage as WebsocketReturnRequest).status,
        data: (wsMessage as WebsocketReturnRequest).data
      }
    }
  })
})

Router.post('/', celebrate({
  [Segments.BODY]: Joi.object().keys({
    client_id: Joi.string().allow(''),
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
  const client = getClientByClientID(clients, req.query.client_id) || getClientByClientID(clients, req.body.client_id)
  const messageID: string = uuidv4()

  if (!client || !client.ws) {
    return res.status(400).json({
      message: 'client not connected or invalid client ID'
    })
  }

  let stringifyRequest: string = ''
  try {
    stringifyRequest = JSON.stringify({
      uuid: messageID,
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

    const message = await waitResponse(client, messageID).catch((err) => {
      console.error(err)
      res.status(200).json({
        message: `data sent to ${remoteAddress}`
      })
    })

    if (message) {
      delete client.message[messageID]
      return res.status(200).json({
        message: `data sent to ${remoteAddress}`,
        request: {
          messageID: messageID,
          message
        }
      })
    }
  })

  return null
})

const waitResponse = (client: WebsocketClient, messageID: string) => {
  return new Promise<object | null>((resolve, reject) => {
    const time = Date.now()
    const interval = setInterval(() => {
      if (Date.now() - time >= 1000) {
        clearInterval(interval)
        return reject(new Error('Reponse timeout'))
      }
      if (!client?.message[messageID]) {
        return
      }

      clearInterval(interval)
      return resolve(client.message[messageID])
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
