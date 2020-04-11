// eslint-disable-next-line no-unused-vars
import * as express from 'express'
import expressLoader from './express'
import websocketLoader from './websocket'

export default async ({ expressApp }: { expressApp: express.Application }) => {
  await websocketLoader()
  await expressLoader({ app: expressApp })
}
