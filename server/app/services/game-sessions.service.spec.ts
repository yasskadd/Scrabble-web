/* eslint-disable max-lines */
import { GameParameters } from '@app/classes/game-parameters';
import { GameRoom } from '@app/classes/game-room';
import { GameSessions } from '@app/services/game-sessions.service';
import { SocketEvents } from '@common/socket-events';
import { assert, expect } from 'chai';
import { createServer, Server } from 'http';
// import { Server } from 'app/server';
import { AddressInfo } from 'net';
import * as sinon from 'sinon';
import { io as Client, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';

const TIMEOUT_WAIT = 200;
type Parameters = { id: string; name: string };
type SioSignature = SocketManager['sio'];
const PLAYER_NAME = 'Vincent';
const OPPONENT_NAME = 'Maurice';
const SOCKET_ID = 'EFOFJS4534';
const ROOM_ID = '1';
const IS_ROOM_NOT_AVAILABLE = false;
const GAME_ROOM: GameRoom = {
    socketID: [SOCKET_ID],
    id: ROOM_ID,
    isAvailable: !IS_ROOM_NOT_AVAILABLE,
    users: ['Maurice'],
    dictionary: 'Francais',
    timer: 1,
    mode: 'classique',
};
const GAME_ROOM_2_PLAYER: GameRoom = {
    socketID: [SOCKET_ID, 'sfdg78fdsg'],
    id: ROOM_ID,
    isAvailable: IS_ROOM_NOT_AVAILABLE,
    users: ['Vincent', 'Maurice'],
    dictionary: 'Francais',
    timer: 1,
    mode: 'classique',
};
const GAME_PARAMETERS: GameParameters = {
    username: 'Vincent',
    dictionary: 'Francais',
    timer: 1,
    mode: 'classique',
};
describe('GameSession Service', () => {
    let gameSessions: GameSessions;
    let service: SocketManager;
    let httpServer: Server;
    let clientSocket: Socket;
    let port: number;
    let sio: SioSignature;
    // const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        gameSessions = new GameSessions(service);
        //   server = Container.get(Server);
        //   server.init();
        // eslint-disable-next-line dot-notation
        service = Container.get(SocketManager);
        httpServer = createServer();
        httpServer.listen();
        service.init(httpServer);
        // Reason :  to be able to use sio for tests
        // eslint-disable-next-line dot-notation
        sio = service['sio'];

        // clientSocket.open();
        //  clientSocket = ioClient(urlString);
        service.handleSockets();
        const addr = httpServer.address() as AddressInfo;
        port = addr.port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.open();
    });

    afterEach(() => {
        clientSocket.close();
        //     // eslint-disable-next-line dot-notation
        //     service['sio'].close();
        sio.close();
        sinon.restore();
    });

    it('removeUserFromActiveUsers should remove a user to the activeUsers map and searching with is socket ID', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers'].set(SOCKET_ID, PLAYER_NAME));
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(1);
        gameSessions.removeUserFromActiveUsers(SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(0);
        done();
    });

    it('addUserToActiveUsers should add a user to the activeUsers map', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(0);
        gameSessions.addUserToActiveUsers(PLAYER_NAME, SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(1);
        done();
    });

    it('removeRoom should remove a room from the gameRoom map ', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(1);
        gameSessions.removeRoom(ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(0);
        done();
    });
    it('removeUserFromRoom should remove a  User from a room if the room is in the list ', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'removeUserFromActiveUsers');
        const spy2 = sinon.spy(gameSessions, 'makeRoomAvailable');

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(2);
        gameSessions.removeUserFromRoom(PLAYER_NAME, SOCKET_ID, ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(1);
        assert(spy.called);
        assert(spy2.called);
        done();
    });

    it('removeUserFromRoom should  not remove a user from a room if the user is not in the room ', (done: Mocha.Done) => {
        const userName = 'Marcel';
        const gameRoomTest: GameRoom = {
            socketID: [SOCKET_ID, 'sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: IS_ROOM_NOT_AVAILABLE,
            users: ['Vincent', 'Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(2);
        gameSessions.removeUserFromRoom(userName, SOCKET_ID, ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(2);
        done();
    });
    // TODO: TEST TO DO AFTER
    // it("removeUserFromRoom should  not remove a user from a room if the room doesn't exist  ", (done: Mocha.Done) => {
    //     const USER_NAME = 'Marc';
    //     const SOCKET_ID = 'fgsgdfg5634';
    //     const GAME_ROOM: GameRoom = {
    //         id: '1',
    //         isAvailable: false,
    //         users: ['Vincent', 'Maurice'],
    //         dictionary: 'Francais',
    //         timer: 1,
    //         mode: 'classique',
    //     };
    //     const roomID = '2';
    // });

    it('addUserToRoom should add a  user to a room if the room is in the MAP ', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'addUserToActiveUsers');
        const spy2 = sinon.spy(gameSessions, 'makeRoomUnavailable');

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(1);
        gameSessions.addUserToRoom(PLAYER_NAME, SOCKET_ID, ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(2);
        assert(spy.called);
        assert(spy2.called);
        done();
    });
    // TODO: TEST TO DO AFTER (check if the room is not in the MAP)

    it('makeRoomUnavailable should put the room Unavailable if the roomID is the key of a gameRoom in the gameRooms Map', (done: Mocha.Done) => {
        const gameRoomAvailable: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomAvailable);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.isAvailable).equal(!IS_ROOM_NOT_AVAILABLE);
        gameSessions.makeRoomUnavailable(ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.isAvailable).not.equal(!IS_ROOM_NOT_AVAILABLE);
        done();
    });

    it('makeRoomAvailable should put the room Available if the roomID is the key of a gameRoom in the gameRooms Map', (done: Mocha.Done) => {
        const gameRoomNotAvailable: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: IS_ROOM_NOT_AVAILABLE,
            users: ['Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomNotAvailable);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.isAvailable).equal(IS_ROOM_NOT_AVAILABLE);
        gameSessions.makeRoomAvailable(ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.isAvailable).not.equal(IS_ROOM_NOT_AVAILABLE);
        done();
    });

    it('getOpponentName should return the name of the other player in the gameRoom', (done: Mocha.Done) => {
        const gameRoom2: GameRoom = {
            socketID: [SOCKET_ID, 'sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: IS_ROOM_NOT_AVAILABLE,
            users: [OPPONENT_NAME, PLAYER_NAME],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoom2);
        // eslint-disable-next-line dot-notation
        expect(gameSessions.getOpponentName(PLAYER_NAME, ROOM_ID)).equal(OPPONENT_NAME);
        // eslint-disable-next-line dot-notation
        expect(gameSessions.getOpponentName(OPPONENT_NAME, ROOM_ID)).equal(PLAYER_NAME);
        done();
    });

    it("getOpponentName should return a empty string if the room doesn't exist", (done: Mocha.Done) => {
        const GAME_ROOM_2: GameRoom = {
            socketID: [SOCKET_ID, 'sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: IS_ROOM_NOT_AVAILABLE,
            users: [OPPONENT_NAME, PLAYER_NAME],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const undefinedRoomID = '2';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2);
        // eslint-disable-next-line dot-notation
        expect(gameSessions.getOpponentName(PLAYER_NAME, undefinedRoomID)).equal('');
        // eslint-disable-next-line dot-notation
        done();
    });
    it('sameUsernameExists should return true if the user in the room Has the same name that the player in the room', (done: Mocha.Done) => {
        const sameName = 'Maurice';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        expect(gameSessions.sameUsernameExists(sameName, ROOM_ID)).equal(true);
        done();
    });
    it('sameUsernameExists should return false if the user in the room has not the same name that the player in the room', (done: Mocha.Done) => {
        const notSameName = 'Paul';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        expect(gameSessions.sameUsernameExists(notSameName, ROOM_ID)).equal(false);
        done();
    });

    // TODO: CHECK TEST
    it('setupNewRoom should add the room in the map of the room and return an ID for this room', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'addUserToActiveUsers');
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(0);
        gameSessions.setupNewRoom(GAME_PARAMETERS, SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(1);
        // expect(gameSessions.setupNewRoom(GAME_PARAMETERS, SOCKET_ID)).equal(gameSessions.idCounter);
        assert(spy.called);
        done();
    });

    it('roomStatus should return the isAvailable property of the GameRoom', (done: Mocha.Done) => {
        const gameRoomTest: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const roomIDInvalid = '2';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest);
        expect(gameSessions.roomStatus(ROOM_ID)).equal(!IS_ROOM_NOT_AVAILABLE);
        expect(gameSessions.roomStatus(roomIDInvalid)).not.equal(!IS_ROOM_NOT_AVAILABLE);
        done();
    });

    it('getAvailableRooms should return an Array with all the room that are Available', (done: Mocha.Done) => {
        const gameRoomTest: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: true,
            users: ['Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const gameRoomTest2: GameRoom = {
            socketID: [SOCKET_ID],
            id: '2',
            isAvailable: false,
            users: ['Vincent'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const roomID2 = '2';
        let GAME_ROOM_AVAILABLE = gameSessions.getAvailableRooms();
        expect(GAME_ROOM_AVAILABLE.length).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(roomID2, gameRoomTest2);
        // eslint-disable-next-line dot-notation
        GAME_ROOM_AVAILABLE = gameSessions.getAvailableRooms();
        expect(GAME_ROOM_AVAILABLE.length).equal(2);
        done();
    });

    it('getActiveUser should return an Array with all the user that are active in games', (done: Mocha.Done) => {
        const socketID2 = 'SFDG356FDS';
        let activeUser = gameSessions.getActiveUser();
        expect(activeUser.size).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['activeUsers'].set(SOCKET_ID, PLAYER_NAME);
        // eslint-disable-next-line dot-notation
        gameSessions['activeUsers'].set(socketID2, OPPONENT_NAME);
        // eslint-disable-next-line dot-notation
        activeUser = gameSessions.getActiveUser();
        expect(activeUser.size).equal(2);
        done();
    });
    it('getNewId should return a new id for a new room', (done: Mocha.Done) => {
        const gameId = gameSessions.getNewId();
        expect(gameId).equal((--gameSessions.idCounter).toString());
        done();
    });

    it('createGame should return confirmation that the game was created with the id of the room', (done: Mocha.Done) => {
        gameSessions.initSocketEvents();

        clientSocket.emit('createGame', GAME_PARAMETERS);
        clientSocket.on('gameCreatedConfirmation', (roomId: string) => {
            expect(roomId).to.contain((--gameSessions.idCounter).toString());
            done();
        });
    });
    it('createGame should made the user join a room ', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        const spy = sinon.spy(service['sio'], 'to');
        gameSessions.initSocketEvents();
        clientSocket.emit('createGame', GAME_PARAMETERS);
        setTimeout(() => {
            clientSocket.open();
            // eslint-disable-next-line dot-notation
            const newRoomSize = service['sio'].sockets.adapter.rooms.get((--gameSessions.idCounter).toString())?.size;
            expect(newRoomSize).to.equal(1);
            assert(spy.called);
            clientSocket.close();
            done();
        }, TIMEOUT_WAIT);
    });
    it('startScrabbleGame should emit an event to the player in the room where a game is about to start', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        const spy = sinon.spy(service['sio'], 'to');
        gameSessions.initSocketEvents();
        clientSocket.emit(SocketEvents.StartScrabbleGame, ROOM_ID);
        setTimeout(() => {
            clientSocket.open();
            assert(spy.called);
            clientSocket.close();
            done();
        }, TIMEOUT_WAIT);
    });

    // TODO: COMEBACK LATER
    it('rejectByOtherPlayer should emit to everyone the updated list of rooms', (done: Mocha.Done) => {
        const parameters: Parameters = {
            id: ROOM_ID,
            name: OPPONENT_NAME,
        };
        // eslint-disable-next-line dot-notation
        const spy = sinon.spy(service['sio'], 'to');
        gameSessions.initSocketEvents();
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.emit(SocketEvents.RejectByOtherPlayer, parameters);
        setTimeout(() => {
            assert(spy.called);
            done();
        }, TIMEOUT_WAIT);
    });

    it('rejectOpponent should emit an a message to the other player because he is being rejected from the game  ', (done: Mocha.Done) => {
        const playerRejectFromRoomError = "L'adversaire à rejeter votre demande";
        const clientSocket2 = Client(`http://localhost:${port}`);

        gameSessions.initSocketEvents();
        clientSocket.emit(SocketEvents.JoinRoom, ROOM_ID);
        clientSocket2.emit(SocketEvents.JoinRoom, ROOM_ID);
        clientSocket.emit(SocketEvents.RejectOpponent, ROOM_ID);

        clientSocket2.on(SocketEvents.RejectByOtherPlayer, (reason: string) => {
            expect(reason).to.contain(playerRejectFromRoomError);
        });
        setTimeout(done, TIMEOUT_WAIT);
    });

    it('removeRoom should remove the room from the list and emit the updated list of room available ', (done: Mocha.Done) => {
        gameSessions.initSocketEvents();
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        clientSocket.emit(SocketEvents.RemoveRoom, ROOM_ID);
        setTimeout(() => {
            // eslint-disable-next-line dot-notation
            expect(gameSessions['gameRooms'].size).to.equal(0);

            done();
        }, TIMEOUT_WAIT);
    });
    it('joinRoom should add the socket to the room after the event', (done: Mocha.Done) => {
        gameSessions.initSocketEvents();
        clientSocket.emit(SocketEvents.JoinRoom, ROOM_ID);
        setTimeout(() => {
            // eslint-disable-next-line dot-notation
            const newRoomSize = service['sio'].sockets.adapter.rooms.get(ROOM_ID.toString())?.size;
            expect(newRoomSize).to.equal(1);
            clientSocket.close();
            done();
        }, TIMEOUT_WAIT);
    });

    it('roomLobby should make the player join the room to be able to get all the room available ', (done: Mocha.Done) => {
        const PLAYERS_JOINING_ROOM = 'joinGameRoom';
        gameSessions.initSocketEvents();
        clientSocket.emit(SocketEvents.RoomLobby);
        setTimeout(() => {
            // eslint-disable-next-line dot-notation
            const newRoomSize = service['sio'].sockets.adapter.rooms.get(PLAYERS_JOINING_ROOM)?.size;
            expect(newRoomSize).to.equal(1);
            done();
        }, TIMEOUT_WAIT);
    });

    it('roomJoin should emit an error if the person in the room have the same name that the player that want to join', (done: Mocha.Done) => {
        const SAME_USER_IN_ROOM_ERROR = "L'adversaire a le même nom";
        const parameters: Parameters = { id: '1', name: 'Vincent' };
        gameSessions.initSocketEvents();
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(SOCKET_ID, GAME_ROOM);
        clientSocket.emit(SocketEvents.PlayerJoinGameAvailable, parameters);
        clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            expect(reason).to.equal(SAME_USER_IN_ROOM_ERROR);
            clientSocket.close();
            done();
        });
    });

    it('roomJoin should not add the player in the room if an error occurred', (done: Mocha.Done) => {
        const clientSocket2 = Client(`http://localhost:${port}`);
        const parameters: Parameters = { id: '1', name: 'Vincent' };

        gameSessions.initSocketEvents();
        clientSocket2.emit('createGame', GAME_PARAMETERS);
        clientSocket.emit('roomJoin', parameters);
        setTimeout(() => {
            clientSocket.open();
            // eslint-disable-next-line dot-notation
            const newRoomSize = service['sio'].sockets.adapter.rooms.get(ROOM_ID)?.size;
            expect(newRoomSize).to.equal(1);
            clientSocket.close();
            done();
        }, TIMEOUT_WAIT);
    });
    // TODO: Correction to the test
    // it('roomJoin should add the player in the room if no problem occurred', (done: Mocha.Done) => {
    //     const parameters: Parameters = { id: '1', name: 'Bob' };
    //     const clientSocket2 = Client(`http://localhost:${port}`);
    //     clientSocket2.emit('createGame', GAME_PARAMETERS);
    //     clientSocket.emit('roomJoin', parameters);
    //     setTimeout(() => {
    //         clientSocket.open();
    //         // eslint-disable-next-line dot-notation
    //         const newRoomSize = service['sio'].sockets.adapter.rooms.get(ROOM_ID)?.size;
    //         expect(newRoomSize).to.equal(2);
    //         clientSocket.close();
    //         done();
    //     }, TIMEOUT_WAIT);
    // });
    // it('roomJoin should emit an error if the room is full and he try to join the room', (done: Mocha.Done) => {
    //     const ROOM_NOT_AVAILABLE_ERROR = "La salle n'est plus disponible";
    //     const parameters: Parameters = { id: '1', name: 'Chris' };
    //     const gameRoomFull: GameRoom = {
    //         socketID: [SOCKET_ID, 'sfdg78fdsg'],
    //         id: ROOM_ID,
    //         isAvailable: false,
    //         users: ['Vincent', 'Maurice'],
    //         dictionary: 'Francais',
    //         timer: 1,
    //         mode: 'classique',
    //     };

    //     // eslint-disable-next-line dot-notation
    //     gameSessions['gameRooms'].set(SOCKET_ID, gameRoomFull);
    //     clientSocket.emit(SocketEvents.PlayerJoinGameAvailable, parameters);
    //     clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
    //         expect(reason).to.equal(ROOM_NOT_AVAILABLE_ERROR);
    //         clientSocket.close();
    //         done();
    //     });
    // });
});
