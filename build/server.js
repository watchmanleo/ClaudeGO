import express from 'express';
import { Gauge, collectDefaultMetrics } from 'prom-client';
import { getCommand } from './server/command.js';
import { server } from './server/socketServer.js';
import { spawn } from './server/spawn.js';
import { sshDefault, serverDefault, forceSSHDefault, defaultCommand, } from './shared/defaults.js';
import { logger as getLogger } from './shared/logger.js';
export * from './shared/interfaces.js';
export { logger as getLogger } from './shared/logger.js';
const wettyConnections = new Gauge({
    name: 'wetty_connections',
    help: 'number of active socket connections to wetty',
});
export const start = (ssh = sshDefault, serverConf = serverDefault, command = defaultCommand, forcessh = forceSSHDefault, ssl = undefined) => decorateServerWithSsh(express(), ssh, serverConf, command, forcessh, ssl);
export async function decorateServerWithSsh(app, ssh = sshDefault, serverConf = serverDefault, command = defaultCommand, forcessh = forceSSHDefault, ssl = undefined) {
    const logger = getLogger();
    if (ssh.key) {
        logger.warn(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
! Password-less auth enabled using private key from ${ssh.key}.
! This is dangerous, anything that reaches the wetty server
! will be able to run remote operations without authentication.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    }
    collectDefaultMetrics();
    const io = await server(app, serverConf, ssl);
    io.on('connection', async (socket) => {
        logger.info('Connection accepted.');
        wettyConnections.inc();
        try {
            const args = await getCommand(socket, ssh, command, forcessh);
            logger.debug('Command Generated', { cmd: args.join(' ') });
            await spawn(socket, args);
        }
        catch (error) {
            logger.info('Disconnect signal sent', { err: error });
            wettyConnections.dec();
        }
    });
    return io;
}
//# sourceMappingURL=server.js.map