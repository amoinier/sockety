import 'source-map-support/register'

import WSClient from './classes/WSClient'

const connectWebsocket = ():void => {
  if (!process.env.SERVER_IP) {
    console.error(new Error('No SERVER_IP set'))
    return
  }

  const client = WSClient.getInstance()
  client.setWebsocket((process.env.SERVER_IP || 'localhost').toString(), parseInt(process.env.SERVER_PORT || '8000'))
  client.init().then((restart?: Boolean) => {
    if (restart) {
      return connectWebsocket()
    }
  }).catch((err: Error) => {
    console.log(err)
  })
}

connectWebsocket()
