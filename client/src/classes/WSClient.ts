import WebSocket from 'ws'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

interface ClientIDObject {
  clientID: string
}

interface WebsocketRequest {
  uuid: string
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH' | undefined
  url: string
  headers: object | string
  body: object | string
}

interface WebsocketReturnRequest {
  uuid?: string
  status: number
  data: object
}

class WSClient {
  private static instance: WSClient
  ws?: WebSocket

  static getInstance (): WSClient {
    if (!WSClient.instance) {
      WSClient.instance = new WSClient()
    }

    return WSClient.instance
  }

  setWebsocket (ip: string, port: number) {
    this.ws = new WebSocket(`ws://${ip}:${port}`)
  }

  init () {
    const clientID = process.env.WEBSOCKET_CLIENTID || uuidv4().toString()

    return new Promise<Boolean>((resolve) => {
      if (this.ws) {
        this.ws.on('open', () => {
          console.log(`websocket connected! Use ${clientID} as query param (ex: ?client_id=${clientID})`)

          this.sendData({
            clientID: clientID
          })
        })

        this.ws.on('error', (err: Error) => {
          if (err.message.includes('ECONNREFUSED')) {
            console.error('server closed')
          }
        })

        this.ws.on('message', async (data: string) => {
          let request: WebsocketRequest

          try {
            const str = Buffer.from(data.toString(), 'base64').toString()
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
            request = {
              uuid: '',
              method: undefined,
              url: '',
              headers: {},
              body: {}
            }
            console.log(e)
          }

          if (!request || !request.method || !request.url || !request.uuid) {
            this.sendData({
              uuid: request?.uuid,
              status: 400,
              data: {
                message: 'request data error'
              }
            })
          }

          const result = await axios({
            url: request.url,
            method: request.method,
            data: request.body,
            headers: request.headers
          }).catch((err: {response: WebsocketReturnRequest}) => {
            const returnData: WebsocketReturnRequest = {
              uuid: request?.uuid,
              status: err.response.status,
              data: err.response.data
            }

            this.sendData(returnData)
          })

          if (result) {
            const returnData: WebsocketReturnRequest = {
              uuid: request?.uuid,
              status: (result as WebsocketReturnRequest)?.status,
              data: (result as WebsocketReturnRequest)?.data
            }

            this.sendData(returnData)
          }
        })

        this.ws.on('close', () => {
          setTimeout(() => {
            return resolve(true)
          }, 2000)
        })
      }
    })
  }

  sendData (data: WebsocketReturnRequest | ClientIDObject) {
    return new Promise<Boolean>((resolve, reject) => {
      let stringifyReturnData: string = ''
      try {
        stringifyReturnData = JSON.stringify(data)
      } catch (err) {
        return reject(err)
      }

      const encodedreturnData: string = Buffer.alloc(stringifyReturnData.length, stringifyReturnData).toString('base64')
      if (!this.ws) {
        return reject(new Error('ws not initialized'))
      }

      this.ws.send(encodedreturnData, (err) => {
        if (err) {
          console.log(err)
          return reject(err)
        }

        return resolve(false)
      })
    })
  }
}

export default WSClient
