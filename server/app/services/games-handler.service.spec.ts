import { Game } from '@app/classes/game';
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { Turn } from '@app/classes/turn';
import { GamesHandler } from '@app/services/games-handler.service';
import { SocketEvents } from '@common/socket-events';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { SocketManager } from './socket-manager.service';
interface GameHolder {
    game: Game | undefined;
    players: Player[];
    roomId: string;
}
type SioSignature = SocketManager['sio'];

const ROOM = '0';

describe('GamesHandler Service', () => {
    let gamesHandler: GamesHandler;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: SioSignature;
    let gameInfo: { playerName: string[]; roomId: string; timer: number; socketId: string[] };

    beforeEach((done) => {
        // ||| Stubbing SocketManager |||
        socketManagerStub = sinon.createStubInstance(SocketManager);
        // We need emitRoom to do nothing
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketManagerStub.emitRoom.callsFake(() => {});
        gamesHandler = new GamesHandler(socketManagerStub as unknown as SocketManager);

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
                gameInfo = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id] };
            });
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        clientSocket.close();
        sio.close();
        sinon.restore();
    });

    it('InitSocketEvents() should call the on() and io() methods of socketManager', (done) => {
        gamesHandler.initSocketsEvents();
        expect(socketManagerStub.io.called).to.equal(true);
        expect(socketManagerStub.on.called).to.equal(true);
        done();
    });
    context('Skip tests', () => {
        let game: sinon.SinonStubbedInstance<Game>;
        beforeEach(() => {
            const player = { room: ROOM } as Player;
            game = sinon.createStubInstance(Game);
            game.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            game.turn = { activePlayer: '' } as Turn;
            game.skip.returns(true);
            const gameHolder = { game, players: [] };
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
        });
        it('skip() should call game.skip()', (done) => {
            // eslint-disable-next-line dot-notation
            gamesHandler['skip'](serverSocket);
            expect(game.skip.called).to.equal(true);
            done();
        });
        it('skip() should call changeTurn()', (done) => {
            const changeTurnSpy = sinon.spy(gamesHandler, 'changeTurn' as never);

            // eslint-disable-next-line dot-notation
            gamesHandler['skip'](serverSocket);
            expect(changeTurnSpy.called).to.equal(true);
            done();
        });
    });
    context('CreateGame tests', () => {
        gamesHandler = new GamesHandler(socketManagerStub as unknown as SocketManager);

        it('CreateGame() should call setAndGetPlayer()', (done) => {
            const setAndGetPlayer = sinon.spy(gamesHandler, 'setAndGetPlayer' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](sio, serverSocket, gameInfo);
            expect(setAndGetPlayer.called).to.equal(true);
            done();
        });
        it('CreateGame() should call createNewGame()', (done) => {
            const createNewGameSpy = sinon.spy(gamesHandler, 'createNewGame' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](sio, serverSocket, gameInfo);
            expect(createNewGameSpy.called).to.equal(true);
            done();
        });
    });
    it('CreateGame() should emit game information to the room', (done) => {
        serverSocket.join(ROOM);
        clientSocket.on(SocketEvents.ViewUpdate, (information) => {
            expect(information).to.not.equal(undefined);
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['createGame'](sio, serverSocket, gameInfo);
    });
    it('CreateGame() should add the game to the game Map', () => {
        const GAME_INFO = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id] };
        // eslint-disable-next-line dot-notation
        gamesHandler['createGame'](sio, serverSocket, GAME_INFO);
        // eslint-disable-next-line dot-notation
        expect(gamesHandler['games'].get(ROOM)).to.not.equal(undefined);
    });

    // TODO : add test for subscribers

    it('disconnect() should emit to the room that the opponent left and that the game ended after 5 seconds of waiting for a reconnect', () => {
        let testBoolean = false;
        const player = { room: ROOM } as Player;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        serverSocket.join(ROOM);
        // eslint-disable-next-line dot-notation
        gamesHandler['disconnect'](serverSocket);
        const otherClient = Client(`http://localhost:${port}`);
        serverSocket.join(ROOM);
        otherClient.on(SocketEvents.OpponentGameLeave, () => {
            testBoolean = true;
        });
        otherClient.on(SocketEvents.GameEnd, () => {
            expect(testBoolean).to.be.equal(true);
        });
    });

    // TODO : FINISH TESTS
});
