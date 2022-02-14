/* eslint-disable max-lines */
import { GameParameters } from '@app/classes/game-parameters';
import { GameRoom } from '@app/classes/game-room';
import { GameSessions } from '@app/services/game-sessions.service';
import { SocketEvents } from '@common/socket-events';
import { assert, expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
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
    let service: sinon.SinonStubbedInstance<SocketManager>;
    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: SioSignature;
    // const urlString = 'http://localhost:3000';
    beforeEach((done) => {
        // ||| Stubbing SocketManager |||
        service = sinon.createStubInstance(SocketManager);
        gameSessions = new GameSessions(service as unknown as SocketManager);

        //   server = Container.get(Server);
        //   server.init();
        // eslint-disable-next-line dot-notation
        // service = Container.get(SocketManager);

        // ||| Creating a new Server |||
        httpServer = createServer();
        sio = new ioServer(httpServer);
        // ||| Connecting sockets to corresponding sockets when turning the server on |||
        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            clientSocket = Client(`http://localhost:${port}`);
            // DO STUFF ON CLIENT CONNECT
            // (socketServer is the socket received on the server side, the one we do socket.emit() and stuff from the server)
            sio.on('connection', (socket) => {
                serverSocket = socket;
                console.log(`Server client connected : ${serverSocket.id}`);
            });
            clientSocket.on('connect', done);
        });

        // service.init(httpServer);
        // Reason :  to be able to use sio for tests
        // eslint-disable-next-line dot-notation
        // sio = service['sio'];

        // clientSocket.open();
        //  clientSocket = ioClient(urlString);
        // service.handleSockets();
        // const addr = httpServer.address() as AddressInfo;
        // port = addr.port;
        // clientSocket = Client(`http://localhost:${port}`);
        // clientSocket.open();
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
        // eslint-disable-next-line dot-notation
        gameSessions['removeUserFromActiveUsers'](SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(0);
        done();
    });

    it('addUserToActiveUsers should add a user to the activeUsers map', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['addUserToActiveUsers'](PLAYER_NAME, SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['activeUsers']?.size).equal(1);
        done();
    });

    it('removeRoom should remove a room from the gameRoom map ', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(1);
        // eslint-disable-next-line dot-notation
        gameSessions['removeRoom'](sio, ROOM_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(0);
        done();
    });
    it('removeUserFromRoom should remove a  User from a room if the room is in the list ', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'removeUserFromActiveUsers' as never);
        const spy2 = sinon.spy(gameSessions, 'makeRoomAvailable' as never);

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(2);
        // eslint-disable-next-line dot-notation
        gameSessions['removeUserFromRoom'](PLAYER_NAME, SOCKET_ID, ROOM_ID);
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
        // eslint-disable-next-line dot-notation
        gameSessions['removeUserFromRoom'](userName, SOCKET_ID, ROOM_ID);
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
        const spy = sinon.spy(gameSessions, 'addUserToActiveUsers' as never);
        const spy2 = sinon.spy(gameSessions, 'makeRoomUnavailable' as never);

        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.get(ROOM_ID)?.users.length).equal(1);
        // eslint-disable-next-line dot-notation
        gameSessions['addUserToRoom'](PLAYER_NAME, SOCKET_ID, ROOM_ID);
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
        // eslint-disable-next-line dot-notation
        gameSessions['makeRoomUnavailable'](ROOM_ID);
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
        // eslint-disable-next-line dot-notation
        gameSessions['makeRoomAvailable'](ROOM_ID);
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
        expect(gameSessions['getOpponentName'](PLAYER_NAME, ROOM_ID)).equal(OPPONENT_NAME);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['getOpponentName'](OPPONENT_NAME, ROOM_ID)).equal(PLAYER_NAME);
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
        expect(gameSessions['getOpponentName'](PLAYER_NAME, undefinedRoomID)).equal('');
        // eslint-disable-next-line dot-notation
        done();
    });
    it('sameUsernameExists should return true if the user in the room Has the same name that the player in the room', (done: Mocha.Done) => {
        const sameName = 'Maurice';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['sameUsernameExists'](sameName, ROOM_ID)).equal(true);
        done();
    });
    it('sameUsernameExists should return false if the user in the room has not the same name that the player in the room', (done: Mocha.Done) => {
        const notSameName = 'Paul';
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['sameUsernameExists'](notSameName, ROOM_ID)).equal(false);
        done();
    });

    // TODO: CHECK TEST
    it('setupNewRoom should add the room in the map of the room and return an ID for this room', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'addUserToActiveUsers' as never);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['setupNewRoom'](GAME_PARAMETERS, SOCKET_ID);
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
        // eslint-disable-next-line dot-notation
        expect(gameSessions['roomStatus'](ROOM_ID)).equal(!IS_ROOM_NOT_AVAILABLE);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['roomStatus'](roomIDInvalid)).not.equal(!IS_ROOM_NOT_AVAILABLE);
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
        // eslint-disable-next-line dot-notation
        let GAME_ROOM_AVAILABLE = gameSessions['getAvailableRooms']();
        expect(GAME_ROOM_AVAILABLE.length).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(roomID2, gameRoomTest2);
        // eslint-disable-next-line dot-notation
        GAME_ROOM_AVAILABLE = gameSessions['getAvailableRooms']();
        expect(GAME_ROOM_AVAILABLE.length).equal(2);
        done();
    });

    // TODO: Test to remove if we dont use this function
    // it('getActiveUser should return an Array with all the user that are active in games', (done: Mocha.Done) => {
    //     const socketID2 = 'SFDG356FDS';
    //     // eslint-disable-next-line dot-notation
    //     let activeUser = gameSessions['getActiveUser']();
    //     expect(activeUser.size).equal(0);
    //     // eslint-disable-next-line dot-notation
    //     gameSessions['activeUsers'].set(SOCKET_ID, PLAYER_NAME);
    //     // eslint-disable-next-line dot-notation
    //     gameSessions['activeUsers'].set(socketID2, OPPONENT_NAME);
    //     // eslint-disable-next-line dot-notation
    //     activeUser = gameSessions['getActiveUser']();
    //     expect(activeUser.size).equal(2);
    //     done();
    // });
    it('getNewId should return a new id for a new room', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        const gameId = gameSessions['getNewId']();
        expect(gameId).equal((--gameSessions.idCounter).toString());
        done();
    });

    it('createGame should return confirmation that the game was created with the id of the room', (done: Mocha.Done) => {
        // EXEMPLE HERE !!

        serverSocket.on('createGame', (gameInfo) => {
            // eslint-disable-next-line dot-notation
            gameSessions['createGame'](sio, serverSocket, gameInfo);
        });
        clientSocket.emit('createGame', GAME_PARAMETERS);
        clientSocket.on('gameCreatedConfirmation', (roomId: string) => {
            expect(roomId).to.contain((--gameSessions.idCounter).toString());
            done();
        });
    });

    // it('ExitWaitingRoom should call removeUserFromRoom with is name and the room id', (done: Mocha.Done) => {
    //     const parameters: Parameters = {
    //         id: ROOM_ID,
    //         name: OPPONENT_NAME,
    //     };
    //     const spyOn = sinon.spy(gameSessions, 'removeUserFromRoom' as never);
    //     const clientSocket2 = Client(`http://localhost:${port}`);

    //     clientSocket.emit(SocketEvents.CreateGame, GAME_PARAMETERS);
    //     clientSocket2.emit(SocketEvents.PlayerJoinGameAvailable, parameters);
    //     clientSocket.emit(SocketEvents.ExitWaitingRoom, GAME_PARAMETERS);
    //     setTimeout(() => {
    //         clientSocket.open();
    //         expect(spyOn);
    //         clientSocket.close();
    //         done();
    //     }, TIMEOUT_WAIT);
    // });
    // it('createGame should made the user join a room ', (done: Mocha.Done) => {
    //     // eslint-disable-next-line dot-notation
    //     const spy = sinon.spy(service['sio'], 'to');
    //     gameSessions.initSocketEvents();
    //     clientSocket.emit('createGame', GAME_PARAMETERS);
    //     setTimeout(() => {
    //         clientSocket.open();
    //         // eslint-disable-next-line dot-notation
    //         const newRoomSize = service['sio'].sockets.adapter.rooms.get((--gameSessions.idCounter).toString())?.size;
    //         expect(newRoomSize).to.equal(1);
    //         assert(spy.called);
    //         clientSocket.close();
    //         done();
    //     }, TIMEOUT_WAIT);
    // });
    it('startScrabbleGame should emit an event to the player in the room where a game is about to start', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);
        serverSocket.on(SocketEvents.StartScrabbleGame, (roomId) => {
            // eslint-disable-next-line dot-notation
            gameSessions[SocketEvents.StartScrabbleGame](sio, serverSocket, roomId);
        });
        clientSocket.emit(SocketEvents.StartScrabbleGame, ROOM_ID);
        clientSocket.on(SocketEvents.GameAboutToStart, (socketId: string[]) => {
            expect(socketId).to.equal(GAME_ROOM_2_PLAYER.socketID);
            done();
        });
        setTimeout(done, TIMEOUT_WAIT);
    });

    // // TODO: COMEBACK LATER
    it('rejectByOtherPlayer should call removeUserFromRoom', (done: Mocha.Done) => {
        const parametersTest: Parameters = {
            id: ROOM_ID,
            name: OPPONENT_NAME,
        };
        const spy = sinon.spy(gameSessions, 'removeUserFromRoom' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);

        // eslint-disable-next-line dot-notation
        gameSessions['rejectByOtherPlayer'](sio, serverSocket, parametersTest);

        assert(spy.called);
        done();
    });

    it('rejectOpponent should emit an a message to the other player because he is being rejected from the game  ', (done: Mocha.Done) => {
        const playerRejectFromRoomError = "L'adversaire à rejeter votre demande";
        const clientSocket2 = Client(`http://localhost:${port}`);

        clientSocket.emit(SocketEvents.JoinRoom, ROOM_ID);
        clientSocket2.emit(SocketEvents.JoinRoom, ROOM_ID);
        clientSocket.emit(SocketEvents.RejectOpponent, ROOM_ID);

        clientSocket2.on(SocketEvents.RejectByOtherPlayer, (reason: string) => {
            expect(reason).to.contain(playerRejectFromRoomError);
        });
        setTimeout(done, TIMEOUT_WAIT);
    });

    it('removeRoom should delete the room from the list ', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        const spy = sinon.spy(gameSessions['gameRooms'], 'delete' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);

        // eslint-disable-next-line dot-notation
        gameSessions['removeRoom'](sio, ROOM_ID);

        assert(spy.called);
        done();
    });

    it('exitWaitingRoom should call the method removeUserFromRoom ', (done: Mocha.Done) => {
        const parametersTest: Parameters = {
            id: ROOM_ID,
            name: OPPONENT_NAME,
        };
        // eslint-disable-next-line dot-notation
        const spy = sinon.spy(gameSessions, 'removeUserFromRoom' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);

        // eslint-disable-next-line dot-notation
        gameSessions['exitWaitingRoom'](serverSocket, parametersTest);

        assert(spy.called);
        done();
    });

    it('getRoomId should return null if there is no room Available ', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        const value = gameSessions['getRoomId'](serverSocket.id);
        expect(value).to.equal(null);
        done();
    });
    it('disconnect should call the removeRoom method', (done: Mocha.Done) => {
        const gameRoomAvailable: GameRoom = {
            socketID: [serverSocket.id],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Vincent'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const spy = sinon.spy(gameSessions, 'removeRoom' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomAvailable);

        // eslint-disable-next-line dot-notation
        gameSessions['disconnect'](sio, serverSocket);

        assert(spy.called);
        done();
    });

    it('disconnect should call the removeUserFromActiveUser method', (done: Mocha.Done) => {
        const gameRoomAvailable: GameRoom = {
            socketID: [serverSocket.id],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Vincent'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const spy = sinon.spy(gameSessions, 'removeUserFromActiveUsers' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomAvailable);

        // eslint-disable-next-line dot-notation
        gameSessions['disconnect'](sio, serverSocket);

        assert(spy.called);
        done();
    });
    // it('joinRoom should add the socket to the room after the event', (done: Mocha.Done) => {
    //     clientSocket.emit(SocketEvents.JoinRoom, ROOM_ID);
    //     setTimeout(() => {
    //         // eslint-disable-next-line dot-notation
    //         const newRoomSize = service['sio'].sockets.adapter.rooms.get(ROOM_ID.toString())?.size;
    //         expect(newRoomSize).to.equal(1);
    //         clientSocket.close();
    //         done();
    //     }, TIMEOUT_WAIT);
    // });

    // it('roomLobby should make the player join the room to be able to get all the room available ', (done: Mocha.Done) => {
    //     gameSessions.initSocketEvents();
    //     clientSocket.emit(SocketEvents.RoomLobby);
    //     setTimeout(() => {
    //         // eslint-disable-next-line dot-notation
    //         done();
    //     }, TIMEOUT_WAIT);
    // });

    it('roomJoin should emit an error if the person in the room have the same name that the player that want to join', (done: Mocha.Done) => {
        const sameUserError = "L'adversaire a le même nom";
        const parameters2: Parameters = { id: '1', name: 'Vincent' };
        const gameRoomAvailable: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Vincent'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomAvailable);
        serverSocket.on(SocketEvents.PlayerJoinGameAvailable, (parameters) => {
            // eslint-disable-next-line dot-notation
            gameSessions['playerJoinGameAvailable'](sio, serverSocket, parameters);
        });
        clientSocket.emit(SocketEvents.PlayerJoinGameAvailable, parameters2);
        clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            expect(reason).to.equal(sameUserError);
            done();
        });
    });

    // it('roomJoin should not add the player in the room if an error occurred', (done: Mocha.Done) => {
    //     const clientSocket2 = Client(`http://localhost:${port}`);
    //     const parameters: Parameters = { id: '1', name: 'Vincent' };

    //     gameSessions.initSocketEvents();
    //     clientSocket2.emit('createGame', GAME_PARAMETERS);
    //     clientSocket.emit('roomJoin', parameters);
    //     setTimeout(() => {
    //         clientSocket.open();
    //         // eslint-disable-next-line dot-notation
    //         const newRoomSize = service['sio'].sockets.adapter.rooms.get(ROOM_ID)?.size;
    //         expect(newRoomSize).to.equal(1);
    //         clientSocket.close();
    //         done();
    //     }, TIMEOUT_WAIT);
    // });
    // TODO: Correction to the test
    it('roomJoin should add the player in the room if no problem occurred', (done: Mocha.Done) => {
        const gameRoomAvailable: GameRoom = {
            socketID: ['sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: !IS_ROOM_NOT_AVAILABLE,
            users: ['Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        const parametersTest: Parameters = { id: '1', name: 'Chris' };
        const spy = sinon.spy(gameSessions, 'addUserToRoom' as never);
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomAvailable);
        // eslint-disable-next-line dot-notation
        gameSessions['playerJoinGameAvailable'](sio, serverSocket, parametersTest);
        assert(spy.called);
        done();
    });
    it('roomJoin should emit an error if the room is full and he try to join the room', (done: Mocha.Done) => {
        const roomNotAvailableError = "La salle n'est plus disponible";
        const parametersTest: Parameters = { id: '1', name: 'Chris' };
        const gameRoomFull: GameRoom = {
            socketID: [SOCKET_ID, 'sfdg78fdsg'],
            id: ROOM_ID,
            isAvailable: false,
            users: ['Vincent', 'Maurice'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomFull);
        serverSocket.on(SocketEvents.PlayerJoinGameAvailable, (parameters) => {
            // eslint-disable-next-line dot-notation
            gameSessions['playerJoinGameAvailable'](sio, serverSocket, parameters);
        });
        clientSocket.emit(SocketEvents.PlayerJoinGameAvailable, parametersTest);
        clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            expect(reason).to.equal(roomNotAvailableError);
            done();
        });
    });
});
