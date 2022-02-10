import { GameParameters } from '@app/classes/game-parameters';
import { GameRoom } from '@app/classes/game-room';
import { SocketEvents } from '@common/socket-events';
// import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { SocketManager } from './socket-manager.service';

const UNAVAILABLE_ELEMENT_INDEX = -1;

const PLAYERS_JOINING_ROOM = 'joinGameRoom';
const SAME_USER_IN_ROOM_ERROR = "L'adversaire a le même nom";
const ROOM_NOT_AVAILABLE_ERROR = "La salle n'est plus disponible";
const PLAYERS_REJECT_FROM_ROOM_ERROR = "L'adversaire à rejeter votre demande";

type Parameters = { id: string; name: string };

@Service()
export class GameSessions {
    idCounter: number;
    private gameRooms: Map<string, GameRoom>;
    private activeUsers: Map<string, string>;

    constructor(private socketManager: SocketManager) {
        this.gameRooms = new Map<string, GameRoom>();
        this.activeUsers = new Map<string, string>();
        this.idCounter = 0;
    }

    initSocketEvents() {
        this.socketManager.io(SocketEvents.CreateGame, (sio, socket, gameInfo: GameParameters) => {
            const roomId = this.setupNewRoom(gameInfo, socket.id);
            socket.join(roomId);
            socket.emit(SocketEvents.GameCreatedConfirmation, roomId);
            sio.to(PLAYERS_JOINING_ROOM).emit(SocketEvents.UpdateRoomJoinable, this.getAvailableRooms());
        });

        this.socketManager.io(SocketEvents.PlayerJoinGameAvailable, (sio, socket, parameters: Parameters) => {
            const roomId = parameters.id;
            const username = parameters.name;

            const roomIsAvailable = this.roomStatus(roomId);
            const userNotTheSame = !this.sameUsernameExists(username, roomId);

            if (roomIsAvailable && userNotTheSame) {
                socket.leave(PLAYERS_JOINING_ROOM);
                socket.join(roomId);
                this.addUserToRoom(username, socket.id, roomId);
                socket.emit(SocketEvents.JoinValidGame, this.getOpponentName(username, roomId));
                socket.broadcast.to(roomId).emit(SocketEvents.FoundAnOpponent, username);
            } else if (!userNotTheSame) socket.emit(SocketEvents.ErrorJoining, SAME_USER_IN_ROOM_ERROR);
            else socket.emit(SocketEvents.ErrorJoining, ROOM_NOT_AVAILABLE_ERROR);

            sio.to(PLAYERS_JOINING_ROOM).emit(SocketEvents.UpdateRoomJoinable, this.getAvailableRooms());
        });

        this.socketManager.io(SocketEvents.RoomLobby, (sio, socket) => {
            socket.join(PLAYERS_JOINING_ROOM);
            sio.to(PLAYERS_JOINING_ROOM).emit(SocketEvents.UpdateRoomJoinable, this.getAvailableRooms());
        });

        this.socketManager.on(SocketEvents.ExitWaitingRoom, (socket, parameters: Parameters) => {
            const roomId = parameters.id;
            const playerName = parameters.name;
            socket.broadcast.to(roomId).emit(SocketEvents.OpponentLeave);
            socket.leave(roomId);
            socket.join(PLAYERS_JOINING_ROOM);
            this.removeUserFromRoom(playerName, socket.id, roomId);
        });

        this.socketManager.io(SocketEvents.RemoveRoom, (sio, _, roomID: string) => {
            this.removeRoom(roomID);
            sio.to(PLAYERS_JOINING_ROOM).emit(SocketEvents.UpdateRoomJoinable, this.getAvailableRooms());
        });

        this.socketManager.on(SocketEvents.RejectOpponent, (socket, roomId: string) => {
            socket.broadcast.to(roomId).emit(SocketEvents.RejectByOtherPlayer, PLAYERS_REJECT_FROM_ROOM_ERROR);
        });
        this.socketManager.on(SocketEvents.JoinRoom, (socket, roomID: string) => {
            socket.join(roomID);
        });
        this.socketManager.io(SocketEvents.RejectByOtherPlayer, (sio, socket, parameters: Parameters) => {
            const roomId = parameters.id;
            const playerName = parameters.name;
            socket.leave(roomId);
            socket.join(PLAYERS_JOINING_ROOM);
            this.removeUserFromRoom(playerName, socket.id, roomId);
            sio.to(PLAYERS_JOINING_ROOM).emit(SocketEvents.UpdateRoomJoinable, this.getAvailableRooms());
        });

        this.socketManager.io(SocketEvents.StartScrabbleGame, (sio, _, roomId: string) => {
            sio.to(roomId).emit(SocketEvents.GameAboutToStart);
        });
        this.socketManager.on(SocketEvents.Disconnect, (socket) => {
            const roomId = this.getRoomId(socket.id);
            if (roomId !== null) {
                socket.broadcast.to(roomId).emit('user disconnect');
                this.removeRoom(roomId);
            }
            this.removeUserFromActiveUsers(socket.id);
        });
    }

    private getNewId(): string {
        const id = this.idCounter++;
        return id.toString();
    }

    // TODO : Come back to this
    // getGameRoom(socket: Socket, roomId: string): void {
    //     const room = this.gameRooms.get(roomId);
    //     if (room !== undefined) {
    //         socket.emit('answer', room);
    //     }
    // }

    // private getActiveUser(): Map<string, string> {
    //     return this.activeUsers;
    // }

    private getAvailableRooms(): GameRoom[] {
        const roomAvailableArray: GameRoom[] = [];
        this.gameRooms.forEach((gameRoom) => {
            if (gameRoom.users.length === 1) roomAvailableArray.push(gameRoom);
        });
        return roomAvailableArray;
    }

    private roomStatus(roomID: string): boolean {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) return room.isAvailable;
        return false;
    }

    private setupNewRoom(parameters: GameParameters, socketId: string): string {
        const roomID = this.getNewId();
        const newRoom: GameRoom = {
            id: roomID,
            users: [parameters.username],
            socketID: [socketId],
            isAvailable: true,
            dictionary: parameters.dictionary,
            timer: parameters.timer,
            mode: parameters.mode,
        };
        this.addUserToActiveUsers(parameters.username, socketId);
        this.gameRooms.set(roomID, newRoom);
        return roomID;
    }

    private sameUsernameExists(user: string, roomID: string): boolean {
        const room = this.gameRooms.get(roomID);
        let sameUsername = true;
        if (room !== undefined) sameUsername = room.users[0] === user;
        return sameUsername;
    }

    private getOpponentName(user: string, roomID: string): string {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) {
            if (room.users[0] === user) {
                return room.users[1];
            }
            return room.users[0];
        }

        return '';
    }

    private makeRoomAvailable(roomID: string): void {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) room.isAvailable = true;
    }

    private makeRoomUnavailable(roomID: string): void {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) room.isAvailable = false;
    }

    private addUserToRoom(user: string, socketID: string, roomID: string): void {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) {
            room.users.push(user);
            room.socketID.push(socketID);
        }
        this.addUserToActiveUsers(user, socketID);
        this.makeRoomUnavailable(roomID);
    }

    private removeUserFromRoom(user: string, socketID: string, roomID: string): void {
        const room = this.gameRooms.get(roomID);
        if (room !== undefined) {
            const index: number = room.users.indexOf(user);
            if (index > UNAVAILABLE_ELEMENT_INDEX) room.users.splice(index, 1);
            const index1: number = room.socketID.indexOf(socketID);
            if (index > UNAVAILABLE_ELEMENT_INDEX) room.socketID.splice(index1, 1);
        }

        this.removeUserFromActiveUsers(socketID);
        this.makeRoomAvailable(roomID);
    }

    private removeRoom(roomID: string) {
        this.gameRooms.delete(roomID);
    }

    private addUserToActiveUsers(username: string, socketID: string) {
        this.activeUsers.set(socketID, username);
    }

    private removeUserFromActiveUsers(socketID: string) {
        this.activeUsers.delete(socketID);
    }

    private getRoomId(socketID: string) {
        for (const [key, value] of this.gameRooms.entries()) {
            if (value.socketID.includes(socketID)) return key;
        }
        return null;
    }
}
