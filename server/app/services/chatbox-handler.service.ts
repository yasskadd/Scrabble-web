import { SocketEvents } from '@common/socket-events';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';
@Service()
export class ChatboxHandlerService {
    constructor(public socketManager: SocketManager) {}

    initSocketsEvent() {
        this.socketManager.on(SocketEvents.SendMessage, (socket, message: string) => {
            socket.broadcast.emit('gameMessage', `${socket.id} : ${message}`);
        });
        // this.socketManager.on(SocketEvents.GameCommand, (socket, command: string) => {
        //     console.log(command);
        // });
        this.socketManager.on('disconnect', (socket) => {
            socket.broadcast.emit('user disconnect');
            // console.log(`${socket.id} disconnected`);
        });
        // Exemple de .io
        // this.socketManager.io('roomMessage', (io, socket, message) => {
        //     socket.emit('test');
        //     io.to('room').emit('test', message); // io est la meme chose que .sio du coté socketManager
        // });
    }
}
