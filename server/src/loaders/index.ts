import expressLoader from './express'
import * as express from 'express'

export default async ({ expressApp }: { expressApp: express.Application }) => {
  await expressLoader({ app: expressApp })
}
