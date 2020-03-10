import WebSocket from 'ws'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

interface WebsocketRequest {
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'
  url: string
  headers: object | string
  body: object | string
}

interface WebsocketReturnRequest {
  status: number
  data: object
}

interface TokenObject {
  token: string
}

const connectWebsocket = ():void => {
  const ws = new WebSocket(`ws://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`)

  const token = process.env.WEBSOCKET_TOKEN || uuidv4().toString()

  ws.on('open', () => {
    sendReturnData(ws, {
      token: token
    })
    console.log(`websocket connected! Use ${token} as query param (ex: ?token=${token})`)
  })

  ws.on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) {
      console.error('server closed')
    }
  })

  ws.on('message', async (data) => {
    let request: WebsocketRequest | null

    try {
      const str = Buffer.from(data.toString('base64'), 'base64').toString()
      request = JSON.parse(str)
      if (request !== null) {
        if (request.headers) {
          request.headers = JSON.parse(request.headers as string)
        }
        if (request.body) {
          request.body = JSON.parse(request.body as string)
        }
      }
    } catch (e) {
      request = null
      console.log(e)
    }

    if (!request || !request.method || !request.url) {
      return
    }

    const result = await axios({
      url: request.url,
      method: request.method,
      data: request.body,
      headers: request.headers
    }).catch((err) => {
      const returnData: WebsocketReturnRequest = {
        status: err.response.status,
        data: err.response.data
      }

      return sendReturnData(ws, returnData)
    })

    if (result) {
      const returnData: WebsocketReturnRequest = {
        status: result.status,
        data: result.data
      }

      return sendReturnData(ws, returnData)
    }
  })

  ws.on('close', () => {
    ws.terminate()
    setTimeout(() => {
      return connectWebsocket()
    }, 2000)
  })
}

const sendReturnData = (ws: WebSocket, returnData: WebsocketReturnRequest | TokenObject): void => {
  let stringifyReturnData: string = ''
  try {
    stringifyReturnData = JSON.stringify(returnData)
  } catch (err) {
    console.log(err)
  }

  const encodedreturnData: string = Buffer.alloc(stringifyReturnData.length, stringifyReturnData).toString('base64')

  ws.send(encodedreturnData)
}

connectWebsocket()
