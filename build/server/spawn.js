import isUndefined from 'lodash/isUndefined.js';
import pty from 'node-pty';
import { logger as getLogger } from '../shared/logger.js';
import { tinybuffer, FlowControlServer } from './flowcontrol.js';
import { xterm } from './shared/xterm.js';
import { envVersionOr } from './spawn/env.js';
export async function spawn(socket, args) {
    const logger = getLogger();
    const version = await envVersionOr(0);
    const cmd = version >= 9 ? ['-S', ...args] : args;
    logger.debug('Spawning PTY', { cmd });
    const term = pty.spawn('/usr/bin/env', cmd, xterm);
    const { pid } = term;
    const address = args[0] === 'ssh' ? args[1] : 'localhost';
    logger.info('Process Started on behalf of user', { pid, address });
    socket.emit('login');
    let disconnectTimer = null;
    let lastActivity = Date.now();
    const DISCONNECT_GRACE_PERIOD = 30 * 60 * 1000;
    term.on('exit', (code) => {
        logger.info('Process exited', { code, pid });
        socket.emit('logout');
        socket
            .removeAllListeners('disconnect')
            .removeAllListeners('resize')
            .removeAllListeners('input')
            .removeAllListeners('activity');
        if (disconnectTimer) {
            clearTimeout(disconnectTimer);
        }
    });
    const send = tinybuffer(socket, 2, 524288);
    const fcServer = new FlowControlServer();
    term.on('data', (data) => {
        send(data);
        if (fcServer.account(data.length)) {
            term.pause();
        }
    });
    socket
        .on('resize', ({ cols, rows }) => {
        term.resize(cols, rows);
        lastActivity = Date.now();
    })
        .on('input', input => {
        if (!isUndefined(term))
            term.write(input);
        lastActivity = Date.now();
    })
        .on('activity', () => {
        lastActivity = Date.now();
        logger.debug('Activity ping received', { pid });
    })
        .on('disconnect', () => {
        logger.info('Socket disconnected, starting grace period', { pid });
        disconnectTimer = setTimeout(() => {
            const inactiveTime = Date.now() - lastActivity;
            if (inactiveTime > DISCONNECT_GRACE_PERIOD) {
                logger.info('Grace period expired, killing process', { pid, inactiveTime });
                term.kill();
            }
            else {
                logger.info('Process kept alive due to recent activity', { pid, inactiveTime });
            }
        }, DISCONNECT_GRACE_PERIOD);
    })
        .on('commit', size => {
        if (fcServer.commit(size)) {
            term.resume();
        }
    });
}
//# sourceMappingURL=spawn.js.map