import type { SSH } from '../shared/interfaces';
import type { Socket } from 'socket.io';
export declare function getCommand(socket: Socket, { user, host, port, auth, pass, key, knownHosts, config, allowRemoteHosts, allowRemoteCommand, }: SSH, command: string, forcessh: boolean): Promise<string[]>;
