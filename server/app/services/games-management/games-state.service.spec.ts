/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function*/
/* eslint-disable dot-notation*/
import { Game } from '@app/classes/game';
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterReserve } from '@app/classes/letter-reserve';
import { BeginnerBot } from '@app/classes/player/beginner-bot.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { GamesHandler } from '@app/services/games-management/games-handler.service';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { SocketEvents } from '@common/constants/socket-events';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ReplaySubject } from 'rxjs';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { GamesStateService } from './games-state.service';

const ROOM = '0';

describe.only('GamesState Service', () => {
    let gamesStateService: GamesStateService;
    let gamesHandlerStub: sinon.SinonStubbedInstance<GamesHandler>;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let scoreStorageStub: sinon.SinonStubbedInstance<ScoreStorageService>;
    let game: sinon.SinonStubbedInstance<Game> & Game;

    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: ioServer;

    let player1: sinon.SinonStubbedInstance<RealPlayer>;
    let player2: sinon.SinonStubbedInstance<RealPlayer>;
    // let gameInfo: { playerName: string[]; roomId: string; timer: number; socketId: string[]; mode: string; botDifficulty?: string };

    beforeEach((done) => {
        player1 = sinon.createStubInstance(RealPlayer);
        player2 = sinon.createStubInstance(RealPlayer);

        player1.room = '1';
        player2.room = '1';
        player1.rack = [{ value: 'c', quantity: 2, points: 1 }];
        player2.rack = [{ value: 'c', quantity: 2, points: 1 }];
        player1.score = 0;
        player2.score = 0;

        game = sinon.createStubInstance(Game) as sinon.SinonStubbedInstance<Game> & Game;
        game.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        game.letterReserve = sinon.createStubInstance(LetterReserve) as unknown as LetterReserve;
        game.letterReserve.lettersReserve = [{ value: 'c', quantity: 2, points: 1 }];
        game.gameboard = sinon.createStubInstance(Gameboard);

        player1.game = game;

        socketManagerStub = sinon.createStubInstance(SocketManager);
        scoreStorageStub = sinon.createStubInstance(ScoreStorageService);
        gamesHandlerStub = sinon.createStubInstance(GamesHandler);
        gamesStateService = new GamesStateService(socketManagerStub as never, gamesHandlerStub as never, scoreStorageStub as never);

        gamesHandlerStub.players = new Map();
        gamesHandlerStub.gamePlayers = new Map();

        httpServer = createServer();
        sio = new ioServer(httpServer);
        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            clientSocket = Client(`http://localhost:${port}`);
            sio.on('connection', (socket) => {
                serverSocket = socket;
                // gameInfo = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id], mode: 'Classique', botDifficulty: undefined };
            });
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        // game.turn.countdown.unsubscribe();
        // game.turn.endTurn.unsubscribe();
        clientSocket.close();
        sio.close();
        sinon.restore();
    });
    it('InitSocketEvents() should call the on() methods of socketManager', (done) => {
        const createGameSpy = sinon.stub(gamesStateService, 'createGame' as never);
        const disconnectSpy = sinon.stub(gamesStateService, 'disconnect' as never);
        const abandonGameSpy = sinon.stub(gamesStateService, 'abandonGame' as never);

        gamesStateService.initSocketsEvents();
        const CALL_NUMBER = 4;
        for (let i = 0; i < CALL_NUMBER; i++) {
            socketManagerStub.on.getCall(i).args[1](serverSocket);
        }

        expect(createGameSpy.called).to.be.eql(true);
        expect(disconnectSpy.called).to.be.eql(true);
        expect(abandonGameSpy.called).to.be.eql(true);
        expect(socketManagerStub.on.called).to.equal(true);

        done();
    });

    it('setAndGetPlayer() should set a new player and return him for the first player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';
        const EXPECTED_NEW_PLAYER = new Player(FIRST_PLAYER);
        EXPECTED_NEW_PLAYER.room = ROOM;

        const gameInformation = {
            playerName: [FIRST_PLAYER],
            roomId: ROOM,
            timer: 0,
            socketId: [FIRST_PLAYER_SOCKET_ID],
            mode: 'Classique',
            botDifficulty: undefined,
        };

        const newPlayer = gamesStateService['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);

        expect(gamesHandlerStub['players'].get(FIRST_PLAYER_SOCKET_ID) as Player).to.be.eql(EXPECTED_NEW_PLAYER as Player);
    });
    it('setAndGetPlayer() should set a new player and return him for the second player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const SECOND_PLAYER = 'LITTLEBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';
        const SECOND_PLAYER_SOCKET_ID = '1';
        const EXPECTED_NEW_PLAYER = new Player(SECOND_PLAYER);
        EXPECTED_NEW_PLAYER.room = ROOM;

        const gameInformation = {
            playerName: [FIRST_PLAYER, SECOND_PLAYER],
            roomId: ROOM,
            timer: 0,
            socketId: [FIRST_PLAYER_SOCKET_ID, SECOND_PLAYER_SOCKET_ID],
            mode: 'Classique',
            botDifficulty: undefined,
        };

        gamesStateService['setAndGetPlayer'](gameInformation) as Player;

        const newPlayer = gamesStateService['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);

        expect(gamesHandlerStub['players'].get(SECOND_PLAYER_SOCKET_ID) as Player).to.be.eql(EXPECTED_NEW_PLAYER as Player);
    });
    it('setAndGetPlayer() should set a Beginner bot player and return him for the second player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const SECOND_PLAYER = 'LITTLEBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';

        const gameInformation = {
            playerName: [FIRST_PLAYER, SECOND_PLAYER],
            roomId: ROOM,
            timer: 0,
            socketId: [FIRST_PLAYER_SOCKET_ID],
            mode: 'Classique',
            botDifficulty: 'Débutant',
        };
        const EXPECTED_NEW_PLAYER = new BeginnerBot(false, SECOND_PLAYER, { timer: gameInformation.timer, roomId: gameInformation.roomId });

        gamesStateService['setAndGetPlayer'](gameInformation) as Player;

        const newPlayer = gamesStateService['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);
    });
    it('setAndGetPlayer() should set a  Expert bot player and return him for the second player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const SECOND_PLAYER = 'LITTLEBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';

        const gameInformation = {
            playerName: [FIRST_PLAYER, SECOND_PLAYER],
            roomId: ROOM,
            timer: 0,
            socketId: [FIRST_PLAYER_SOCKET_ID],
            mode: 'Classique',
            botDifficulty: 'Expert',
        };
        const EXPECTED_NEW_PLAYER = new BeginnerBot(false, SECOND_PLAYER, { timer: gameInformation.timer, roomId: gameInformation.roomId });

        gamesStateService['setAndGetPlayer'](gameInformation) as Player;

        const newPlayer = gamesStateService['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);
    });

    it('createNewGame() should return a new game created', () => {
        sinon.stub(Turn);
        const TIMER = 60;
        const params = {
            playerName: [player1.name, player2.name],
            roomId: '1',
            timer: TIMER,
            socketId: [serverSocket.id],
            mode: 'Classique',
            botDifficulty: undefined,
        };

        gamesHandlerStub['gamePlayers'].set(player1.room, [player1, player2]);

        const gameTest = gamesStateService['createNewGame'](params);

        expect(gameTest !== undefined).to.eql(true);
    });

    it("changeTurn() should send the game's information when called and the active player isn't undefined", () => {
        gamesHandlerStub['gamePlayers'].set(player1.room, [player1, player2]);
        gamesStateService['changeTurn']('1');
        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.Skip, game));
    });
});
