/* eslint-disable no-unused-vars */
import WebSocket from 'ws'

import WSClient from './WSClient'

class WSConnexion {
  private static instance: WSConnexion
  server: WebSocket.Server
  clients: Array<WSClient>

  private constructor () {
    this.server = new WebSocket.Server({ port: parseInt(process.env.WEBSOCKET_PORT || '8000') })
    this.clients = []
  }

  static getInstance (): WSConnexion {
    if (WSConnexion.instance == null) {
      WSConnexion.instance = new WSConnexion()
    }
    return WSConnexion.instance
  }

  create () {
    WSConnexion.getInstance().server.on('connection', (ws: WebSocket, req) => {
      const client: WSClient = new WSClient(ws, req)

      client.messageEvent()
    })
  }

  addClient (client: WSClient) {
    this.clients.push(client)
  }

  deleteClient (toDelete: WSClient) {
    const index: number = this.clients.findIndex((client: WSClient) => client.clientID === toDelete.clientID)
    if (index === -1) {
      return
    }

    this.clients.splice(index, 1)
  }

  getClientByClientID = (clientID: string): WSClient | undefined => {
    return this.clients.find(client => client.clientID === clientID)
  }

  deleteWebsocketClient = (toDelete: WSClient): void => {
    const index: number = this.clients.findIndex((client: WSClient) => client.clientID === toDelete.clientID)
    if (index === -1) {
      return
    }
    this.clients.splice(index, 1)
  }
}

export default WSConnexion
