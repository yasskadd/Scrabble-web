import { SocketEvents } from '@common/socket-events';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';
@Service()
export class ChatboxHandlerService {
    constructor(public socketManager: SocketManager) {}

    initSocketsEvents() {
        this.socketManager.on(SocketEvents.SendMessage, this.sendMessage);

        this.socketManager.on(SocketEvents.Disconnect, this.disconnectEvent);

        // this.socketManager.on(SocketEvents.GameCommand, (socket, command: string) => {
        //     console.log(command);
        // });

        // Exemple de .io
        // this.socketManager.io('roomMessage', (io, socket, message) => {
        //     socket.emit('test');
        //     io.to('room').emit('test', message); // io est la meme chose que .sio du coté socketManager
        // });
    }

    private disconnectEvent(socket: Socket) {
        socket.broadcast.emit('user disconnect');
    }
    private sendMessage(socket: Socket, message: string) {
        socket.broadcast.emit('gameMessage', `${socket.id} : ${message}`);
    }
}
