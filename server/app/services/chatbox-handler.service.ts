import { SocketEvents } from '@common/socket-events';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';

type MessageParameters = { roomId: string; message: string };
@Service()
export class ChatboxHandlerService {
    constructor(public socketManager: SocketManager) {}

    initSocketsEvents() {
        this.socketManager.on(SocketEvents.SendMessage, this.sendMessage);
        // TODO: A modifier

        // this.socketManager.on(SocketEvents.Disconnect, (socket) => {
        //     // eslint-disable-next-line dot-notation
        //     const arr = Array.from(this.socketManager['sio'].sockets.adapter.rooms);
        //     // eslint-disable-next-line dot-notation
        //     const filtered = arr.filter((room) => !room[1].has(room[0]));

        //     const roomId = filtered.map((i) => i[0]);
        //     // console.log(roomId);
        //     if (roomId[0]) {
        //         socket.broadcast.to(roomId[0]).emit(SocketEvents.OpponentDisconnect);
        //     }
        // });

        // this.socketManager.on(SocketEvents.Disconnect, this.disconnectEvent);

        // this.socketManager.on(SocketEvents.GameCommand, (socket, command: string) => {
        //     console.log(command);
        // });
        // Exemple de .io
        // this.socketManager.io('roomMessage', (io, socket, message) => {
        //     socket.emit('test');
        //     io.to('room').emit('test', message); // io est la meme chose que .sio du coté socketManager
        // });
    }

    // private disconnectEvent(socket: Socket) {
    //     // eslint-disable-next-line dot-notation
    //     const arr = Array.from(this.socketManager['sio'].sockets.adapter.rooms);
    //     const filtered = arr.filter((room) => !room[1].has(room[0]));
    //     const roomId = filtered.map((i) => i[0]);
    //     if (roomId[0]) {
    //         socket.broadcast.to(roomId[0]).emit(SocketEvents.OpponentDisconnect);
    //     }
    // }
    private sendMessage(socket: Socket, messageInfo: MessageParameters) {
        socket.broadcast.to(messageInfo.roomId).emit('gameMessage', `${messageInfo.message}`);
    }
}
