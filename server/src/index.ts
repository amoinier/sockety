import express from 'express'

import loaders from './loaders'

const startServer = async () => {
  const app = express()

  loaders({ expressApp: app })

  console.log(process.env.HTTP_PORT)

  app.listen(process.env.HTTP_PORT || 3000, (): void => {
    console.log(`listening on ${process.env.HTTP_PORT || 3000}`)
  })
}

startServer()
