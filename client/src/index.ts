import 'source-map-support/register';

import WSClient from './classes/WSClient';

function connectWebsocket() {
  if (!process.env.SERVER_IP) {
    console.error(new Error('No SERVER_IP set'));

    return;
  }

  const client = WSClient.getInstance();

  client.setWebsocket(
    process.env.SERVER_IP || 'localhost',
    parseInt(process.env.SERVER_PORT || '8000'),
  );
  client.init();
  client
    .eventClose()
    .then(restart => {
      if (restart) {
        return connectWebsocket();
      }
    })
    .catch((err: Error) => {
      console.error(err);

      return connectWebsocket();
    });
}

connectWebsocket();
