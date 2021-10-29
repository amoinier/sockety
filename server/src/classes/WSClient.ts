/* eslint-disable no-unused-vars */
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import WSConnexion from './WSConnexion';

interface WSClientInterface {
  clientID: string;
  ws: WebSocket;
  req: IncomingMessage;
  isAlive: boolean;
  interval?: NodeJS.Timeout;
  message: {
    [messageID: string]: Record<string, unknown>;
  };
}

interface ReturnResponse {
  message: string;
  request?: Record<string, unknown>;
  err?: Error;
}

interface WebsocketReturnRequest {
  uuid: string;
  status: number;
  data: object | string;
}

interface ClientIDObject {
  clientID: string;
}

class WSClient implements WSClientInterface {
  clientID: string;
  ws: WebSocket;
  req: IncomingMessage;
  isAlive: boolean;
  interval?: NodeJS.Timeout;
  message: {
    [messageID: string]: Record<string, unknown>;
  };

  constructor(ws: WebSocket, req: IncomingMessage) {
    this.clientID = '';
    this.ws = ws;
    this.req = req;
    this.isAlive = true;
    this.message = {};
  }

  messageEvent() {
    this.ws.on('message', (message: string | WebSocket.Data) => {
      const wsMessage: ClientIDObject | WebsocketReturnRequest | null = decodeString(message);

      if (!wsMessage) {
        console.error('wsMessage is null');
        return this.ws.terminate();
      }
      if ('clientID' in wsMessage && wsMessage.clientID) {
        this.init(wsMessage);
      }
      if ('uuid' in wsMessage && wsMessage.uuid) {
        this.newMessage(wsMessage);
      }
    });
  }

  init(wsMessage: ClientIDObject) {
    this.clientID = wsMessage.clientID;
    WSConnexion.getInstance().addClient(this);

    this.interval = setInterval(() => {
      if (this.isAlive === false) {
        return this.ws.terminate();
      }

      this.isAlive = false;
      this.ws.ping(() => {
        console.log('ping');
      });
    }, 30000);

    this.ws.on('pong', () => {
      this.isAlive = true;
    });

    this.ws.on('close', () => {
      this.closeConnection();
      WSConnexion.getInstance().deleteClient(this);
    });
  }

  closeConnection() {
    this.isAlive = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log(`Connexion websocket from ${this.clientID} has been closed`);
  }

  waitResponse(messageID: string) {
    return new Promise<Record<string, unknown> | null>((resolve, reject) => {
      const time = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - time >= 1000) {
          clearInterval(interval);
          return reject(new Error('Reponse timeout'));
        }
        if (!this?.message[messageID]) {
          return null;
        }

        clearInterval(interval);
        return resolve(this.message[messageID]);
      }, 10);
    });
  }

  newMessage(message: WebsocketReturnRequest) {
    this.message[message.uuid] = {
      status: message.status,
      data: message.data,
    };
  }

  sendMessage(encodedRequest: string, messageID: string) {
    return new Promise<ReturnResponse>((resolve, reject) => {
      this.ws.send(encodedRequest, async (err: Error | undefined) => {
        if (err) {
          return reject(err);
        }

        const remoteAddress: string | undefined = this.req.connection.remoteAddress?.replace(
          /::ffff:/gm,
          '',
        );

        const message = await this.waitResponse(messageID).catch(err => {
          return resolve({
            err: err,
            message: remoteAddress ? `data sent to ${remoteAddress}` : 'data sent',
          });
        });

        if (!message) {
          return;
        }

        delete this.message[messageID];
        return resolve({
          message: remoteAddress ? `data sent to ${remoteAddress}` : 'data sent',
          request: {
            messageID: messageID,
            message,
          },
        });
      });
    });
  }
}

function decodeString(message: WebSocket.Data) {
  if (!message) {
    return null;
  }

  try {
    const parsedMessage: ClientIDObject | WebsocketReturnRequest = JSON.parse(
      Buffer.from(message.toString(), 'base64').toString(),
    );

    return parsedMessage;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default WSClient;
