/* eslint-disable no-unused-vars */
import { Method, AxiosRequestHeaders } from 'axios';
import express, { Request, Response, NextFunction } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { v4 as uuidv4 } from 'uuid';

import WSConnexion from '../classes/WSConnexion';

const Router = express.Router();

interface WSRequest {
  client_id?: string;
  method: Method;
  url: string;
  headers: AxiosRequestHeaders;
  body: {
    [key: string]: unknown;
  };
}

interface RouterQuery {
  client_id: string;
}

type RouterResponse =
  | {
      message: string;
      request?: Record<string, unknown>;
    }
  | {
      error: Error | unknown;
    };

Router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      client_id: Joi.string().allow(''),
      url: Joi.string().uri().required(),
      method: Joi.string()
        .required()
        .valid(
          ...[
            'get',
            'GET',
            'delete',
            'DELETE',
            'head',
            'HEAD',
            'options',
            'OPTIONS',
            'post',
            'POST',
            'put',
            'PUT',
            'patch',
            'PATCH',
          ],
        ),
      headers: Joi.object(),
      body: Joi.object(),
    }),
    [Segments.QUERY]: Joi.object().keys({
      client_id: Joi.string(),
    }),
  }),
  (
    req: Request<any, any, WSRequest, RouterQuery>,
    res: Response<RouterResponse>,
    _: NextFunction,
  ) => {
    const request = req.body;
    const clientID = request.client_id || req.query.client_id || '';
    const client = WSConnexion.getInstance().getClientByClientID(clientID);
    const messageID = uuidv4();

    if (!client || !client.ws) {
      return res.status(400).json({
        message: 'client not connected or invalid client ID',
      });
    }

    try {
      const stringifyRequest = JSON.stringify({
        uuid: messageID,
        method: request.method,
        url: request.url,
        header: JSON.stringify(request.headers),
        body: JSON.stringify(request.body),
      });

      const encodedRequest = Buffer.alloc(stringifyRequest.length, stringifyRequest).toString(
        'base64',
      );

      client
        .sendMessage(encodedRequest, messageID)
        .then(result => {
          if (result.err) {
            console.log(result.err);
          }
          return res.status(200).json({
            message: result.message,
            request: result.request,
          });
        })
        .catch((err: Error) => {
          return res.status(500).json({ error: err });
        });

      return null;
    } catch (err) {
      console.error(err);

      return res.status(500).json({ error: err });
    }
  },
);

export default Router;
