import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import favicon from 'serve-favicon'
import path from 'path'
import bodyParser from 'body-parser'

import sockety from './sockety'

// import api from './api'

const app = express()

dotenv.config()

app.use(bodyParser.json({ limit: '1mb' }))
app.use(cors())
app.use(favicon(path.join('./', 'public', 'favicon.png')))

app.use('/sockety', sockety)

app.use((_: express.Request, res: express.Response): void => {
  res.status(404).send()
})

app.listen(process.env.HTTP_PORT || 3000, (): void => {
  console.log(`listening on ${process.env.HTTP_PORT || 3000}`)
})
