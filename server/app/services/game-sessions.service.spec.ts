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
    beforeEach((done) => {
        service = sinon.createStubInstance(SocketManager);
        gameSessions = new GameSessions(service as unknown as SocketManager);

        httpServer = createServer();
        sio = new ioServer(httpServer);
        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            clientSocket = Client(`http://localhost:${port}`);
            sio.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        clientSocket.close();
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

    it('setupNewRoom should add the room in the map of the room and return an ID for this room', (done: Mocha.Done) => {
        const spy = sinon.spy(gameSessions, 'addUserToActiveUsers' as never);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(0);
        // eslint-disable-next-line dot-notation
        gameSessions['setupNewRoom'](GAME_PARAMETERS, SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(gameSessions['gameRooms']?.size).equal(1);
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
        const timeout6seconds = 6000;
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
        setTimeout(() => {
            assert(spy.called);
            done();
        }, timeout6seconds);
    });
    it('disconnect should call the removeRoom method after 6 seconds ', (done: Mocha.Done) => {
        const timeout6seconds = 6000;
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
        setTimeout(() => {
            assert(spy.called);
            done();
        }, timeout6seconds);
    });
    it('disconnect should call the removeUserFromActiveUser method after 6 seconds but not the removeRoom', (done: Mocha.Done) => {
        const timeout6seconds = 6000;
        const spy = sinon.spy(gameSessions, 'removeRoom' as never);
        const spy1 = sinon.spy(gameSessions, 'removeUserFromActiveUsers' as never);
        // eslint-disable-next-line dot-notation

        // eslint-disable-next-line dot-notation
        gameSessions['disconnect'](sio, serverSocket);
        setTimeout(() => {
            assert(spy.notCalled);
            assert(spy1.called);
            done();
        }, timeout6seconds);
    });

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

    it('InitSocketEvents() should call the on() and io() methods of socketManager', (done) => {
        const createGameSpy = sinon.stub(gameSessions, 'createGame' as never);
        const playerJoinGameSpy = sinon.stub(gameSessions, 'playerJoinGameAvailable' as never);
        const roomLobbySpy = sinon.stub(gameSessions, 'roomLobby' as never);
        const exitWaitingRoomSpy = sinon.stub(gameSessions, 'exitWaitingRoom' as never);
        const removeRoomSpy = sinon.stub(gameSessions, 'removeRoom' as never);
        const rejectOpponentSpy = sinon.stub(gameSessions, 'rejectOpponent' as never);
        const joinRoomSpy = sinon.stub(gameSessions, 'joinRoom' as never);
        const rejectByOtherPlayerSpy = sinon.stub(gameSessions, 'rejectByOtherPlayer' as never);
        const startScrabbleGameSpy = sinon.stub(gameSessions, 'startScrabbleGame' as never);
        const disconnectSpy = sinon.stub(gameSessions, 'disconnect' as never);
        const callSocketEvent4 = 4;
        const callSocketEvent5 = 5;
        const callSocketEvent6 = 6;

        gameSessions.initSocketEvents();
        service.io.getCall(0).args[1](sio, serverSocket);
        service.io.getCall(1).args[1](sio, serverSocket);
        service.io.getCall(2).args[1](sio, serverSocket);
        service.io.getCall(3).args[1](sio, serverSocket);
        service.io.getCall(callSocketEvent4).args[1](sio, serverSocket);
        service.io.getCall(callSocketEvent5).args[1](sio, serverSocket);
        service.io.getCall(callSocketEvent6).args[1](sio, serverSocket);

        service.on.getCall(0).args[1](serverSocket);
        service.on.getCall(1).args[1](serverSocket);
        service.on.getCall(2).args[1](serverSocket);

        expect(createGameSpy.called).to.be.eql(true);
        expect(playerJoinGameSpy.called).to.be.eql(true);
        expect(roomLobbySpy.called).to.be.eql(true);
        expect(exitWaitingRoomSpy.called).to.be.eql(true);
        expect(removeRoomSpy.called).to.be.eql(true);
        expect(rejectOpponentSpy.called).to.be.eql(true);
        expect(joinRoomSpy.called).to.be.eql(true);
        expect(rejectByOtherPlayerSpy.called).to.be.eql(true);
        expect(startScrabbleGameSpy.called).to.be.eql(true);
        expect(disconnectSpy.called).to.be.eql(true);

        expect(service.io.called).to.equal(true);
        expect(service.on.called).to.equal(true);
        done();
    });

    it('joinRoom should make the player join the room with the roomID parameter', (done: Mocha.Done) => {
        // eslint-disable-next-line dot-notation
        gameSessions['joinRoom'](serverSocket, ROOM_ID);
        expect(serverSocket.rooms).contain(ROOM_ID);
        done();
    });

    it('joinRoom should make the player join a room to be updated with the room Available to join', (done: Mocha.Done) => {
        const playerJoiningRoom = 'joinGameRoom';
        // eslint-disable-next-line dot-notation
        gameSessions['roomLobby'](sio, serverSocket);
        expect(serverSocket.rooms).contain(playerJoiningRoom);
        done();
    });
    it('getRoomId should return the key of a socket ID ', (done: Mocha.Done) => {
        const gameRoomTest2: GameRoom = {
            socketID: [SOCKET_ID],
            id: '2',
            isAvailable: false,
            users: ['Vincent'],
            dictionary: 'Francais',
            timer: 1,
            mode: 'classique',
        };
        // eslint-disable-next-line dot-notation
        gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest2);
        // eslint-disable-next-line dot-notation
        const key = gameSessions['getRoomId'](SOCKET_ID);
        // eslint-disable-next-line dot-notation
        expect(key).to.equal(ROOM_ID);
        done();
    });

    context('Two Clientsocket tests', () => {
        let secondSocket: Socket;
        beforeEach((done) => {
            serverSocket.join(ROOM_ID);
            secondSocket = Client(`http://localhost:${port}`);
            secondSocket.on('connect', done);
        });
        it('rejectOpponent should emit a message to the other player in the room when he reject him', (done) => {
            const rejectMessage = "L'adversaire à rejeter votre demande";

            clientSocket.on(SocketEvents.RejectByOtherPlayer, (information) => {
                expect(information).to.be.eql(rejectMessage);
                done();
            });
            // eslint-disable-next-line dot-notation
            gameSessions['rejectOpponent'](serverSocket, ROOM_ID);
        });

        it('startScrabbleGame should emit an event to the player in the room with the socketID of the players', (done: Mocha.Done) => {
            // eslint-disable-next-line dot-notation

            // eslint-disable-next-line dot-notation
            gameSessions['gameRooms'].set(ROOM_ID, GAME_ROOM_2_PLAYER);

            clientSocket.on(SocketEvents.GameAboutToStart, (socketId: string[]) => {
                expect(socketId).to.be.eql(GAME_ROOM_2_PLAYER.socketID);
                done();
            });
            // eslint-disable-next-line dot-notation
            gameSessions['startScrabbleGame'](sio, serverSocket, ROOM_ID);
        });

        // it('startScrabbleGame should emit an event to the player in the room with with undefined if there is no socketID', (done: Mocha.Done) => {
        //     // eslint-disable-next-line dot-notation
        //     const gameRoomTest2: GameRoom = {
        //         socketID: undefined,
        //         id: '2',
        //         isAvailable: false,
        //         users: ['Vincent'],
        //         dictionary: 'Francais',
        //         timer: 1,
        //         mode: 'classique',
        //     };
        //     // eslint-disable-next-line dot-notation
        //     gameSessions['gameRooms'].set(ROOM_ID, gameRoomTest2);

        //     clientSocket.on(SocketEvents.GameAboutToStart, (socketId: string[]) => {
        //         console.log(socketId);
        //         done();
        //     });
        //     // eslint-disable-next-line dot-notation
        //     gameSessions['startScrabbleGame'](sio, serverSocket, ROOM_ID);
        // });

        afterEach(() => {
            secondSocket.close();
        });
    });
});
