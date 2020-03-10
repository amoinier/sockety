import * as express from 'express'
import cors from 'cors'
import favicon from 'serve-favicon'
import path from 'path'
import bodyParser from 'body-parser'

import sockety from '../api/sockety'

export default async ({ app }: { app: express.Application }) => {
  app.use(bodyParser.json({ limit: '1mb' }))
  app.use(cors())
  app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.png')))

  app.use('/sockety', sockety)

  app.use((_: express.Request, res: express.Response): void => {
    res.status(404).send('not found')
  })

  return app
}
