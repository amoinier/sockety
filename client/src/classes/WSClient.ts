import WebSocket from 'ws';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface ClientIDObject {
  clientID: string;
}

interface WebsocketRequest {
  uuid: string;
  method:
    | 'get'
    | 'GET'
    | 'delete'
    | 'DELETE'
    | 'head'
    | 'HEAD'
    | 'options'
    | 'OPTIONS'
    | 'post'
    | 'POST'
    | 'put'
    | 'PUT'
    | 'patch'
    | 'PATCH'
    | undefined;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown> | string;
}

interface WebsocketReturnRequest {
  uuid?: string;
  status: number;
  data: unknown;
}

interface AxiosResponse {
  status: number;
  data: unknown;
}

class WSClient {
  private static instance: WSClient;
  ws?: WebSocket;

  static getInstance(): WSClient {
    if (!WSClient.instance) {
      WSClient.instance = new WSClient();
    }

    return WSClient.instance;
  }

  setWebsocket(ip: string, port: number): void {
    this.ws = new WebSocket(`ws://${ip}:${port}`);
  }

  init(): void {
    const clientID = process.env.WEBSOCKET_CLIENTID || uuidv4().toString();

    this.eventOpen(clientID);
    this.eventError();

    if (!this.ws) {
      return;
    }

    this.ws.on('message', async data => {
      const request = await this.convertMessage(data).catch((err: Error) => {
        console.error(err);

        this.sendData({
          uuid: '',
          status: 400,
          data: {
            message: 'request data error',
          },
        }).catch(err => {
          console.error(err);
        });
      });

      if (!request) {
        return;
      }

      const response = await axios({
        url: request.url,
        method: request.method,
        data: request.body,
        headers: request.headers,
      }).catch((err: { response: AxiosResponse }) => {
        const returnData: WebsocketReturnRequest = {
          uuid: request?.uuid,
          status: err.response?.status || 404,
          data: err.response?.data || '',
        };

        this.sendData(returnData).catch(err => {
          console.error(err);
        });
      });

      if (response) {
        const returnData: WebsocketReturnRequest = {
          uuid: request?.uuid,
          status: response?.status,
          data: response?.data,
        };

        this.sendData(returnData).catch(err => {
          console.error(err);
        });
      }
    });
  }

  eventOpen(clientID: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.ws) {
        return reject(new Error('ws not initialized'));
      }

      this.ws.on('open', () => {
        console.log(
          `websocket connected! Use ${clientID} as query param (ex: ?client_id=${clientID})`,
        );

        this.sendData({
          clientID: clientID,
        }).catch((err: Error) => {
          if (err) {
            console.error(err);
          }

          if (this.ws) {
            this.ws.close();
          }
        });
      });
    });
  }

  eventError(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.ws) {
        return reject(new Error('ws not initialized'));
      }

      this.ws.on('error', err => {
        if (err.message.includes('ECONNREFUSED')) {
          console.error('server closed');
        }
      });
    });
  }

  eventClose(): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      if (!this.ws) {
        return reject(new Error('ws not initialized'));
      }

      this.ws.on('close', () => {
        setTimeout(() => {
          return resolve(true);
        }, 2000);
      });
    });
  }

  convertMessage(data: WebSocket.Data): Promise<WebsocketRequest> {
    return new Promise<WebsocketRequest>((resolve, reject) => {
      let request: WebsocketRequest;

      try {
        const str = Buffer.from(data.toString(), 'base64').toString();
        request = JSON.parse(str);
        if (request === null) {
          throw new Error('request is undefined');
        }

        console.log(request.headers);
        console.log(request.body);

        if (request.headers) {
          request.headers = JSON.parse(request.headers as any);
        }
        if (request.body) {
          request.body = JSON.parse(request.body as string);
        }

        return resolve(request);
      } catch (err) {
        console.error(err);

        return reject(err);
      }
    });
  }

  sendData(data: WebsocketReturnRequest | ClientIDObject): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let stringifyReturnData: string;

      try {
        stringifyReturnData = JSON.stringify(data);
      } catch (err) {
        console.error(err);
        return reject(err);
      }

      const encodedreturnData = Buffer.alloc(
        stringifyReturnData.length,
        stringifyReturnData,
      ).toString('base64');
      if (!this.ws) {
        return reject(new Error('ws not initialized'));
      }

      this.ws.send(encodedreturnData, err => {
        if (err) {
          console.error(err);
          return reject(err);
        }

        return resolve();
      });
    });
  }
}

export default WSClient;
