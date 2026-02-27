import http from 'http';
import https from 'https';
import isUndefined from 'lodash/isUndefined.js';
import { Server } from 'socket.io';
import { logger } from '../../shared/logger.js';
export const listen = (app, host, port, path, { key, cert }) => new Server(!isUndefined(key) && !isUndefined(cert)
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
    }), {
    path: `${path}/socket.io`,
    pingInterval: 60000,
    pingTimeout: 600000,
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    upgradeTimeout: 30000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 30 * 60 * 1000,
        skipMiddlewares: true,
    },
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
//# sourceMappingURL=socket.js.map