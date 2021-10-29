import WebSocket from 'ws';
import axios, { AxiosRequestHeaders, Method } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const MAX_WEBSOCKET_SIZE = 1400;

interface ClientIDObject {
  clientID: string;
}

interface WebsocketRequest {
  uuid: string;
  method: Method;
  url: string;
  headers: AxiosRequestHeaders;
  body: Record<string, unknown> | string;
}

interface AxiosResponse {
  status: number;
  data: unknown;
}

type WebsocketReturnRequest =
  | {
      uuid: string;
      status: number;
      data: unknown;
    }
  | ClientIDObject;

class WSClient {
  private static instance: WSClient;
  ws?: WebSocket;

  static getInstance() {
    if (!WSClient.instance) {
      WSClient.instance = new WSClient();
    }

    return WSClient.instance;
  }

  setWebsocket(ip: string, port: number) {
    this.ws = new WebSocket(`ws://${ip}:${port}`);
  }

  init() {
    const clientID = process.env.WEBSOCKET_CLIENTID || uuidv4();

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
        const returnData = {
          uuid: request?.uuid,
          status: err.response?.status || 404,
          data: err.response?.data || '',
        };

        this.sendData(returnData).catch(err => {
          console.error(err);
        });
      });

      if (response) {
        const returnData = {
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

  eventOpen(clientID: string) {
    if (!this.ws) {
      throw new Error('ws not initialized');
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
  }

  eventError() {
    if (!this.ws) {
      throw new Error('ws not initialized');
    }

    this.ws.on('error', err => {
      if (err.message.includes('ECONNREFUSED')) {
        console.error('server closed');
      }
    });
  }

  eventClose() {
    return new Promise<boolean>((resolve, reject) => {
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

  async convertMessage(data: WebSocket.Data) {
    try {
      const str = Buffer.from(data.toString(), 'base64').toString();
      const rowRequest = JSON.parse(str);
      if (rowRequest === null) {
        throw new Error('request is undefined');
      }

      const request: WebsocketRequest = {
        uuid: rowRequest.uuid,
        method: rowRequest.method,
        url: rowRequest.url,
        headers: rowRequest.headers ? JSON.parse(rowRequest.headers) : undefined,
        body: rowRequest.body ? JSON.parse(rowRequest.body) : undefined,
      };

      return request;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  async sendData(data: WebsocketReturnRequest) {
    let stringifyReturnData: string;

    if ('data' in data && typeof data.data === 'string') {
      data.data = data.data.substring(0, MAX_WEBSOCKET_SIZE);
    }

    try {
      stringifyReturnData = JSON.stringify(data);
    } catch (err) {
      console.error(err);
      throw err;
    }

    const encodedreturnData = Buffer.alloc(
      stringifyReturnData.length,
      stringifyReturnData,
    ).toString('base64');
    if (!this.ws) {
      throw new Error('ws not initialized');
    }

    this.ws.send(encodedreturnData, err => {
      if (err) {
        console.error(err);
        throw err;
      }

      return;
    });
  }
}

export default WSClient;
