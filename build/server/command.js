import process from 'node:process';
import url from 'url';
import _ from 'lodash';
import { address } from './command/address.js';
import { loginOptions } from './command/login.js';
import { sshOptions } from './command/ssh.js';
const localhost = (host) => !_.isUndefined(process.getuid) &&
    process.getuid() === 0 &&
    (host === 'localhost' || host === '0.0.0.0' || host === '127.0.0.1');
const urlArgs = (referer, { allowRemoteCommand, allowRemoteHosts, }) => _.pick(_.pickBy(url.parse(referer || '', true).query, _.isString), ['pass'], allowRemoteCommand ? ['command', 'path'] : [], allowRemoteHosts ? ['port', 'host'] : []);
export async function getCommand(socket, { user, host, port, auth, pass, key, knownHosts, config, allowRemoteHosts, allowRemoteCommand, }, command, forcessh) {
    const { request: { headers: { referer } }, client: { conn: { remoteAddress } }, } = socket;
    if (!forcessh && localhost(host)) {
        return loginOptions(command, remoteAddress);
    }
    const sshAddress = await address(socket, user, host);
    const args = {
        host: sshAddress,
        port: `${port}`,
        pass: pass || '',
        command,
        auth,
        knownHosts,
        config: config || '',
        ...urlArgs(referer, { allowRemoteHosts, allowRemoteCommand }),
    };
    return sshOptions(args, key);
}
//# sourceMappingURL=command.js.map