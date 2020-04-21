/* eslint-disable no-unused-vars */
import express from 'express'
import { celebrate, Joi, Segments } from 'celebrate'
import { v4 as uuidv4 } from 'uuid'

import WSConnexion from '../classes/WSConnexion'

const Router = express.Router()

interface WSRequest {
  method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH'
  url: string
  headers: object
  body: object
}

Router.post('/', celebrate({
  [Segments.BODY]: Joi.object().keys({
    client_id: Joi.string().allow(''),
    url: Joi.string().uri().required(),
    method: Joi.string().required().valid(...['get', 'GET', 'delete', 'DELETE', 'head', 'HEAD', 'options', 'OPTIONS', 'post', 'POST', 'put', 'PUT', 'patch', 'PATCH']),
    headers: Joi.object(),
    body: Joi.object()
  }),
  [Segments.QUERY]: Joi.object().keys({
    client_id: Joi.string()
  })
}), (req: express.Request, res: express.Response, next: express.NextFunction): express.Response<any> | null => {
  const request: WSRequest = req.body
  const client = WSConnexion.getInstance().getClientByClientID(req.query.client_id) || WSConnexion.getInstance().getClientByClientID(req.body.client_id)
  const messageID = uuidv4()

  console.log(request)

  if (!client || !client.ws) {
    return res.status(400).json({
      message: 'client not connected or invalid client ID'
    })
  }

  let stringifyRequest: string
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

  const encodedRequest = Buffer.alloc(stringifyRequest.length, stringifyRequest).toString('base64')

  client.sendMessage(encodedRequest, messageID).then(result => {
    if (result.err) {
      console.log(result.err)
    }
    return res.status(200).json({
      message: result.message,
      request: result.request
    })
  }).catch((err: Error) => {
    return res.status(500).json({ error: err })
  })

  return null
})

export default Router
