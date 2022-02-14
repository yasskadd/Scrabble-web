import { Game } from '@app/classes/game';
import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { Turn } from '@app/classes/turn';
import { GamesHandler } from '@app/services/games-handler.service';
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

describe('GamesHandler Service', () => {
    let gamesHandler: GamesHandler;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: SioSignature;

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
            const ROOM = '0';
            const player = { room: ROOM } as Player;
            game = sinon.createStubInstance(Game);
            game.gameboard = { gameboardCoords: [] } as unknown as GameBoard;
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
        // let game: sinon.SinonStubbedInstance<Game>;
        let GAME_INFO: { playerName: string[]; roomId: string; timer: number; socketId: string[] };
        beforeEach(() => {
            const ROOM = '0';
            GAME_INFO = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id] };
        });
        it('CreateGame() should call setAndGetPlayer()', (done) => {
            const setAndGetPlayer = sinon.spy(gamesHandler, 'setAndGetPlayer' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](sio, serverSocket, GAME_INFO);
            expect(setAndGetPlayer.called).to.equal(true);
            done();
        });
        it('CreateGame() should call createNewGame()', (done) => {
            const createNewGameSpy = sinon.spy(gamesHandler, 'createNewGame' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](sio, serverSocket, GAME_INFO);
            expect(createNewGameSpy.called).to.equal(true);
            done();
        });

        // TODO : FINISH TESTS
        // it('CreateGame() should emit information to the room', (done) => {
        //     // eslint-disable-next-line dot-notation
        //     gamesHandler['createGame'](sio, serverSocket, GAME_INFO);
        //     clientSocket.on(SocketEvents.ViewUpdate, (information) => {
        //         expect(information).to.not.equal(undefined);
        //         done();
        //     });
        // });
    });
});
