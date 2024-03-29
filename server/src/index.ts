import express from 'express';
import 'source-map-support/register';

import loaders from './loaders';

async function startServer() {
  const app = express();

  loaders({ expressApp: app });

  app.listen(process.env.HTTP_PORT || 3000, (): void => {
    console.log(`listening on ${process.env.HTTP_PORT || 3000}`);
  });
}

startServer();
