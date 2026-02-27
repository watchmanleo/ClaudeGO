import http from 'http';
import https from 'https';
import isUndefined from 'lodash/isUndefined.js';
import { Server } from 'socket.io';

import { logger } from '../../shared/logger.js';
import type { SSLBuffer } from '../../shared/interfaces.js';
import type express from 'express';

export const listen = (
  app: express.Express,
  host: string,
  port: number,
  path: string,
  { key, cert }: SSLBuffer,
): Server =>
  new Server(
    !isUndefined(key) && !isUndefined(cert)
      ? https.createServer({ key, cert }, app).listen(port, host, () => {
          logger().info('Server started', {
            port,
            connection: 'https',
          });
        })
      : http.createServer(app).listen(port, host, () => {
          logger().info('Server started', {
            port,
            connection: 'http',
          });
        }),
    {
      path: `${path}/socket.io`,
      // Long session support: Keep connection alive for extended periods
      // pingInterval: how often to send ping (every 60 seconds)
      // pingTimeout: how long to wait for pong before disconnecting (10 minutes)
      pingInterval: 60000,
      pingTimeout: 600000,
      // Enable transport fallback for mobile compatibility
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      upgradeTimeout: 30000,
      // Connection state recovery (Socket.IO 4.x)
      // Allow reconnection within 30 minutes of disconnection
      connectionStateRecovery: {
        maxDisconnectionDuration: 30 * 60 * 1000,
        skipMiddlewares: true,
      },
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    },
  );
