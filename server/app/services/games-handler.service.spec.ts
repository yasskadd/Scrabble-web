/* eslint-disable max-lines */
import { Gameboard } from '@app/classes/gameboard.class';
import { BeginnerBot } from '@app/classes/player/bot-beginner.class';
import { Player } from '@app/classes/player/player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { GamesHandler } from '@app/services/games-handler.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ReplaySubject } from 'rxjs';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { RealPlayer } from './../classes/player/real-player.class';
import { Game } from './game.service';
import { LetterPlacementService, PlaceLettersReturn } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';
import { WordSolverService } from './word-solver.service';
const ROOM = '0';

describe('GamesHandler Service', () => {
    let gamesHandler: GamesHandler;
    let scoreStorageStub: sinon.SinonStubbedInstance<ScoreStorageService>;
    let letterPlacementStub: sinon.SinonStubbedInstance<LetterPlacementService>;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let wordSolverStub: sinon.SinonStubbedInstance<WordSolverService>;
    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: ioServer;
    let gameInfo: { playerName: string[]; roomId: string; timer: number; socketId: string[] };
    const player1 = sinon.createStubInstance(RealPlayer);
    const player2 = sinon.createStubInstance(RealPlayer);

    let game: sinon.SinonStubbedInstance<Game> & Game;

    beforeEach((done) => {
        player1.room = '1';
        player2.room = '1';
        player1.rack = [{ value: 'c', quantity: 2, points: 1 }];
        player2.rack = [{ value: 'c', quantity: 2, points: 1 }];
        player1.score = 0;
        player2.score = 0;

        //  game.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        socketManagerStub = sinon.createStubInstance(SocketManager);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketManagerStub.emitRoom.callsFake(() => {});

        letterPlacementStub = sinon.createStubInstance(LetterPlacementService);
        // eslint-disable-next-line @typescript-eslint/no-empty-function

        scoreStorageStub = sinon.createStubInstance(ScoreStorageService);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        scoreStorageStub.addTopScores.callsFake(async (): Promise<void> => {});

        wordSolverStub = sinon.createStubInstance(WordSolverService);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        wordSolverStub.setGameboard.callsFake(() => {});

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        wordSolverStub.findAllOptions.callsFake((): CommandInfo[] => {
            return [];
        });

        game = sinon.createStubInstance(Game) as sinon.SinonStubbedInstance<Game> & Game;
        game.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        game.letterReserve = new LetterReserveService();
        game.letterReserve.lettersReserve = [{ value: 'c', quantity: 2, points: 1 }];
        game.gameboard = sinon.createStubInstance(Gameboard);

        player1.game = game;
        gamesHandler = new GamesHandler(
            socketManagerStub as unknown as SocketManager,
            scoreStorageStub as unknown as ScoreStorageService,
            wordSolverStub as unknown as WordSolverService,
            letterPlacementStub as unknown as LetterPlacementService,
        );

        httpServer = createServer();
        sio = new ioServer(httpServer);
        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            clientSocket = Client(`http://localhost:${port}`);
            sio.on('connection', (socket) => {
                serverSocket = socket;
                gameInfo = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id] };
            });
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        game.turn.countdown.unsubscribe();
        game.turn.endTurn.unsubscribe();
        clientSocket.close();
        sio.close();
        sinon.restore();
    });

    it('InitSocketEvents() should call the on() methods of socketManager', (done) => {
        const createGameSpy = sinon.stub(gamesHandler, 'createGame' as never);
        const playSpy = sinon.stub(gamesHandler, 'playGame' as never);
        const exchangeSpy = sinon.stub(gamesHandler, 'exchange' as never);
        const skipSpy = sinon.stub(gamesHandler, 'skip' as never);
        const disconnectSpy = sinon.stub(gamesHandler, 'disconnect' as never);
        const abandonGameSpy = sinon.stub(gamesHandler, 'abandonGame' as never);
        const reserveCommandSpy = sinon.stub(gamesHandler, 'reserveCommand' as never);
        const clueCommandSpy = sinon.stub(gamesHandler, 'clueCommand' as never);

        gamesHandler.initSocketsEvents();
        const CALL_NUMBER = 9;
        for (let i = 0; i < CALL_NUMBER; i++) {
            socketManagerStub.on.getCall(i).args[1](serverSocket);
        }

        expect(createGameSpy.called).to.be.eql(true);
        expect(playSpy.called).to.be.eql(true);
        expect(exchangeSpy.called).to.be.eql(true);
        expect(skipSpy.called).to.be.eql(true);
        expect(disconnectSpy.called).to.be.eql(true);
        expect(abandonGameSpy.called).to.be.eql(true);
        expect(reserveCommandSpy.called).to.be.eql(true);
        expect(clueCommandSpy.called).to.be.eql(true);
        expect(socketManagerStub.on.called).to.equal(true);

        done();
    });

    it('reserveCommand() should emit the reserve to the client ', (done) => {
        player1.game.letterReserve = {
            lettersReserve: [
                { value: 'c', quantity: 2, points: 1 },
                { value: 'r', quantity: 2, points: 1 },
                { value: 'p', quantity: 2, points: 1 },
            ],
        } as LetterReserveService;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player1);

        clientSocket.on(SocketEvents.AllReserveLetters, (information) => {
            expect(information).to.be.eql(game.letterReserve.lettersReserve);
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['reserveCommand'](serverSocket);
    });

    it('clueCommand() should call wordSolver.setGameboard,  findAllOptions  and configureClueCommand', () => {
        const configureClueCommandSpy = sinon.spy(gamesHandler, 'configureClueCommand' as never);
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player1);
        // eslint-disable-next-line dot-notation
        gamesHandler['clueCommand'](serverSocket);
        // eslint-disable-next-line dot-notation
        expect(wordSolverStub.setGameboard.called).to.equal(true);
        expect(wordSolverStub.findAllOptions.called).to.equal(true);
        expect(configureClueCommandSpy.called).to.equal(true);
    });

    it('configureClueCommand() should return an array with the one placement possible when there is only one available ', (done) => {
        const placementPossible = [
            { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: ['p', 'a', 'r'] as string[], direction: 'v' } as unknown as CommandInfo,
        ];
        // eslint-disable-next-line dot-notation
        expect(gamesHandler['configureClueCommand'](placementPossible)).to.deep.include.members([
            { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: ['p', 'a', 'r'] as string[], direction: 'v' } as unknown as CommandInfo,
        ]);
        done();
    });

    it('clueCommand() should return three placement possible when there is three or more available ', (done) => {
        const placementPossible = [
            { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: ['p', 'a', 'r'] as string[], direction: 'v' } as unknown as CommandInfo,
            { firstCoordinate: { x: 4, y: 4 }, lettersPlaced: ['r', 'a', 'p'] as string[], direction: 'v' } as unknown as CommandInfo,
            { firstCoordinate: { x: 8, y: 8 }, lettersPlaced: ['c', 'a', 'r'] as string[], direction: 'h' } as unknown as CommandInfo,
        ];
        // eslint-disable-next-line dot-notation
        expect(gamesHandler['configureClueCommand'](placementPossible)).to.deep.include.members([
            { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: ['p', 'a', 'r'] as string[], direction: 'v' } as unknown as CommandInfo,
            { firstCoordinate: { x: 4, y: 4 }, lettersPlaced: ['r', 'a', 'p'] as string[], direction: 'v' } as unknown as CommandInfo,
            { firstCoordinate: { x: 8, y: 8 }, lettersPlaced: ['c', 'a', 'r'] as string[], direction: 'h' } as unknown as CommandInfo,
        ]);
        done();
    });

    it('skip() should call player.skipTurn()', (done) => {
        const player = sinon.createStubInstance(RealPlayer);
        const gameStub = sinon.createStubInstance(Game);

        gameStub.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
        gameStub.turn = { activePlayer: '' } as Turn;
        gameStub.skip.returns(true);
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation

        // eslint-disable-next-line dot-notation
        gamesHandler['skip'](serverSocket);
        expect(player.skipTurn.called).to.equal(true);
        done();
    });

    it('sendHighScore() should call scoreStorage.addTopScore', () => {
        const player = { name: 'Vincent', room: ROOM, score: 40 } as Player;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);

        // eslint-disable-next-line dot-notation
        gamesHandler['sendHighScore'](serverSocket.id);
        expect(scoreStorageStub.addTopScores.called).to.equal(true);
    });

    it('userConnected() should call sendHighScore and endGame when the two player are still in the game', () => {
        const endGameStub = sinon.stub(gamesHandler, 'endGame' as never);
        const sendHighScoreStub = sinon.stub(gamesHandler, 'sendHighScore' as never);
        const socketId = ['asdjcvknxcv', '534876tgsdfj'];
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(socketId[0], player1);
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(socketId[1], player2);
        // eslint-disable-next-line dot-notation
        gamesHandler['userConnected'](socketId);
        expect(endGameStub.called).to.equal(true);
        expect(sendHighScoreStub.called).to.equal(true);
    });

    it('userConnected() should call sendHighScore and endGame when the first player is still in the game', () => {
        const endGameStub = sinon.stub(gamesHandler, 'endGame' as never);
        const sendHighScoreStub = sinon.stub(gamesHandler, 'sendHighScore' as never);
        const socketId = ['asdjcvknxcv', '534876tgsdfj'];
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(socketId[0], player1);
        // eslint-disable-next-line dot-notation
        gamesHandler['userConnected'](socketId);
        expect(endGameStub.called).to.equal(true);
        expect(sendHighScoreStub.called).to.equal(true);
    });

    it('userConnected() should call sendHighScore and endGame when the second player is still in the game', () => {
        const endGameStub = sinon.stub(gamesHandler, 'endGame' as never);
        const sendHighScoreStub = sinon.stub(gamesHandler, 'sendHighScore' as never);
        const socketId = ['asdjcvknxcv', '534876tgsdfj'];
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(socketId[1], player2);
        // eslint-disable-next-line dot-notation
        gamesHandler['userConnected'](socketId);
        expect(endGameStub.called).to.equal(true);
        expect(sendHighScoreStub.called).to.equal(true);
    });

    it('sendTimer() should call emitRoom() with the correct parameters', () => {
        // eslint-disable-next-line dot-notation
        gamesHandler['sendTimer'](ROOM, 0);
        expect(socketManagerStub.emitRoom.calledOnceWith(ROOM, SocketEvents.TimerClientUpdate, 0));
    });

    context('endGameScore tests', () => {
        it('endGameScore() should call deductPoints() of each player in a game if there is 6 consecutive skips', () => {
            player1.game.turn.skipCounter = 6;
            const deductPointsSpy = sinon.spy(player1, 'deductPoints');
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGameScore'](player1.room);
            expect(deductPointsSpy.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('endGameScore() should call addPoints() with the second player rack as param for the first player if his rack is empty and call deductPoints() for the other player', () => {
            const addPointsSpy = sinon.spy(player1, 'addPoints');
            const deductPointsSpy = sinon.spy(player2, 'deductPoints');
            player1.rack = [];
            player1.game.turn.skipCounter = 0;
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGameScore'](player1.room);
            expect(addPointsSpy.calledWith(player2.rack)).to.equal(true);
            expect(deductPointsSpy.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('endGameScore() should call addPoints() with the first player rack as param for the second player if his rack is empty and call deductPoints() for the other player', () => {
            const addPointsSpy = sinon.spy(player2, 'addPoints');
            const deductPointsSpy = sinon.spy(player1, 'deductPoints');
            player2.rack = [];
            player1.game.turn.skipCounter = 0;
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGameScore'](player1.room);
            expect(addPointsSpy.calledWith(player1.rack)).to.equal(true);
            expect(deductPointsSpy.called).to.equal(true);
        });
    });

    it('setAndGetPlayer() should set a new player and return him for the first player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';
        const EXPECTED_NEW_PLAYER = new Player(FIRST_PLAYER);
        EXPECTED_NEW_PLAYER.room = ROOM;

        const gameInformation = { playerName: [FIRST_PLAYER], roomId: ROOM, timer: 0, socketId: [FIRST_PLAYER_SOCKET_ID] };
        // eslint-disable-next-line dot-notation
        const newPlayer = gamesHandler['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);
        // eslint-disable-next-line dot-notation
        expect(gamesHandler['players'].get(FIRST_PLAYER_SOCKET_ID) as Player).to.be.eql(EXPECTED_NEW_PLAYER as Player);
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
        };
        // eslint-disable-next-line dot-notation
        gamesHandler['setAndGetPlayer'](gameInformation) as Player;

        // eslint-disable-next-line dot-notation
        const newPlayer = gamesHandler['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);
        // eslint-disable-next-line dot-notation
        expect(gamesHandler['players'].get(SECOND_PLAYER_SOCKET_ID) as Player).to.be.eql(EXPECTED_NEW_PLAYER as Player);
    });

    it('setAndGetPlayer() should set a bot player and return him for the second player', () => {
        const FIRST_PLAYER = 'BIGBROTHER';
        const SECOND_PLAYER = 'LITTLEBROTHER';
        const FIRST_PLAYER_SOCKET_ID = '0';

        const gameInformation = {
            playerName: [FIRST_PLAYER, SECOND_PLAYER],
            roomId: ROOM,
            timer: 0,
            socketId: [FIRST_PLAYER_SOCKET_ID],
        };
        const EXPECTED_NEW_PLAYER = new BeginnerBot(false, SECOND_PLAYER, { timer: gameInformation.timer, roomId: gameInformation.roomId });
        // eslint-disable-next-line dot-notation
        gamesHandler['setAndGetPlayer'](gameInformation) as Player;

        // eslint-disable-next-line dot-notation
        const newPlayer = gamesHandler['setAndGetPlayer'](gameInformation) as Player;
        expect(newPlayer).to.be.eql(EXPECTED_NEW_PLAYER as Player);
        // eslint-disable-next-line dot-notation
    });

    it("changeTurn() should send the game's information when called and the active player isn't undefined", () => {
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);

        // eslint-disable-next-line dot-notation
        gamesHandler['changeTurn']('1');

        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.Skip, game));
    });

    it('createNewGame() should return a new game created', () => {
        const TIMER = 60;
        const params = {
            playerName: [player1.name, player2.name],
            roomId: '1',
            timer: TIMER,
            socketId: [serverSocket.id],
        };
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
        // eslint-disable-next-line dot-notation
        const gameTest = gamesHandler['createNewGame'](params);

        expect(gameTest !== undefined).to.eql(true);
    });

    it('abandonGame() should emit to the room that the opponent left and that the game ended', () => {
        const player = { room: ROOM } as Player;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['abandonGame'](serverSocket);
        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.OpponentGameLeave));
        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.GameEnd));
    });

    it("abandonGame() shouldn't do anything if the player isn't in the map ()", () => {
        // eslint-disable-next-line dot-notation
        gamesHandler['abandonGame'](serverSocket);
        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.OpponentGameLeave)).to.not.be.equal(true);
        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.GameEnd)).to.not.be.equal(true);
    });

    context('Two Clientsocket tests', () => {
        let secondSocket: Socket;
        let playerOne: sinon.SinonStubbedInstance<RealPlayer>;
        let playerTwo: sinon.SinonStubbedInstance<RealPlayer>;

        const RESERVE = [] as Letter[];
        beforeEach((done) => {
            playerOne = sinon.createStubInstance(RealPlayer);
            playerOne.name = 'Cthulhu';
            playerOne.room = ROOM;
            playerOne.isPlayerOne = true;
            playerOne.getInformation.returns({ name: playerOne.name, score: 0, rack: [], room: '0', gameboard: [] });
            playerTwo = sinon.createStubInstance(RealPlayer);
            playerTwo.room = ROOM;
            playerTwo.name = '';
            playerTwo.isPlayerOne = false;
            playerTwo.getInformation.returns({ name: playerTwo.name, score: 0, rack: [], room: '0', gameboard: [] });

            serverSocket.join(ROOM);
            secondSocket = Client(`http://localhost:${port}`);
            secondSocket.on('connect', done);
        });

        afterEach(() => {
            secondSocket.close();
        });

        it('exchange() should emit the exchanged letters to the other player when an exchange occurs', (done) => {
            const LETTER = { value: 'LaStructureDuServeur' } as Letter;
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            player.rack = [LETTER];
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
            const gameStub = sinon.createStubInstance(Game);
            gameStub.turn = { activePlayer: '' } as unknown as Turn;
            player.game = gameStub as unknown as Game;
            player.exchangeLetter.callsFake(() => {
                player.rack = [{ value: 'Ihatetests' } as Letter];
            });
            clientSocket.on(SocketEvents.GameMessage, (message) => {
                expect(message).to.be.equal('!echanger 0 lettres');
                done();
            });

            letterPlacementStub.areLettersInRack.returns(true);
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player.room, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['exchange'](serverSocket, []);
        });

        it('updatePlayerInfo() should broadcast correct info to the first Player', (done) => {
            clientSocket.on(SocketEvents.UpdateOpponentInformation, (information) => {
                expect(information).to.be.eql(playerOne.getInformation());
                done();
            });
            clientSocket.on(SocketEvents.UpdatePlayerInformation, (information) => {
                expect(information).to.be.eql(playerTwo.getInformation());
            });
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, playerOne);

            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
        });

        it('updatePlayerInfo() should broadcast correct info to the second Player', (done) => {
            secondSocket.on(SocketEvents.UpdateOpponentInformation, (information) => {
                expect(information).to.be.eql(playerTwo.getInformation());
                done();
            });
            secondSocket.on(SocketEvents.UpdatePlayerInformation, (information) => {
                expect(information).to.be.eql(playerOne.getInformation());
            });

            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, playerOne);

            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
        });

        it("updatePlayerInfo() should broadcast correct info if it isn't the first player", (done) => {
            secondSocket.on(SocketEvents.UpdateOpponentInformation, (information) => {
                expect(information).to.be.eql(playerOne.getInformation());
                done();
            });
            secondSocket.on(SocketEvents.UpdatePlayerInformation, (information) => {
                expect(information).to.be.eql(playerTwo.getInformation());
            });

            playerOne.isPlayerOne = false;
            playerTwo.isPlayerOne = true;
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, playerOne);

            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
        });

        it('updatePlayerInfo() should emit the letterReserve to the room', () => {
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, playerOne);

            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.LetterReserveUpdated, RESERVE));
        });

        it("updatePlayerInfo() shouldn't do anything if the players are undefined", () => {
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, playerOne);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(playerOne.room, undefined as unknown as Player[]);
            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, playerOne.room, playerOne.game);
            expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
        });
        it('disconnect() should emit to the room that the opponent left/ game ended after 5 seconds of waiting for a reconnect', (done) => {
            const clock = sinon.useFakeTimers();
            const player = new Player('Jean');
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            player.game = gameHolderTest as unknown as Game;
            const timeOut5Seconds = 5500;

            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(ROOM, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['disconnect'](serverSocket);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            clock.tick(timeOut5Seconds);
            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.OpponentGameLeave)).to.be.equal(true);
            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.UserDisconnect)).to.be.equal(true);
            done();
        });
        it("disconnect() shouldn't emit to the room that the opponent left/ game ended after 5 seconds of waiting for a reconnect", (done) => {
            const clock = sinon.useFakeTimers();
            const timeOut5Seconds = 5500;
            let testBoolean1 = false;
            let testBoolean2 = false;
            serverSocket.join(ROOM);
            clientSocket.on(SocketEvents.OpponentGameLeave, () => {
                testBoolean1 = true;
            });
            clientSocket.on(SocketEvents.GameEnd, () => {
                testBoolean2 = true;
            });
            // eslint-disable-next-line dot-notation
            gamesHandler['disconnect'](serverSocket);

            // eslint-disable-next-line @typescript-eslint/no-empty-function
            clock.tick(timeOut5Seconds);
            expect(testBoolean1).to.be.equal(false);
            expect(testBoolean2).to.be.equal(false);
            done();
        });

        it('disconnect() should emit to the room that the opponent left when the game is already finish', (done) => {
            const player = new Player('Jean');
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            player.game = gameHolderTest as unknown as Game;
            player.game.isGameFinish = true;
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(ROOM, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['disconnect'](serverSocket);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            expect(socketManagerStub.emitRoom.called).to.be.equal(true);
            done();
        });

        it('playGame() should call sendValidCommand', () => {
            const sendValidCommandStub = sinon.stub(gamesHandler, 'sendValidCommand' as never);
            serverSocket.join(ROOM);
            const RETURNED_BOOLEAN = true;
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
            const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[], isHorizontal: false } as unknown as CommandInfo;
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            const gameStub = sinon.createStubInstance(Game);
            gameStub.turn = { activePlayer: '' } as unknown as Turn;
            player.placeLetter.returns({
                hasPassed: RETURNED_BOOLEAN,
                gameboard: { gameboardCoords: [] } as unknown as Gameboard,
                invalidWords: {} as Word[],
            });
            player.game = gameStub as unknown as Game;
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(ROOM, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['playGame'](serverSocket, commandInfo);
            expect(sendValidCommandStub.called).to.equal(true);
        });

        it('sendValidCommand() should send to the other player the command inputed', (done) => {
            serverSocket.join(ROOM);
            const RETURNED_BOOLEAN = true;
            const EXPECTED_MESSAGE = '!placer `0v ';
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

            const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[], isHorizontal: false } as unknown as CommandInfo;
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            const gameStub = sinon.createStubInstance(Game);

            clientSocket.on(SocketEvents.GameMessage, (message) => {
                expect(message).to.equal(EXPECTED_MESSAGE);
                done();
            });

            gameStub.turn = { activePlayer: '' } as unknown as Turn;
            player.placeLetter.returns({
                hasPassed: RETURNED_BOOLEAN,
                gameboard: { gameboardCoords: [] } as unknown as Gameboard,
                invalidWords: {} as Word[],
            });
            player.game = gameStub as unknown as Game;

            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(ROOM, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['sendValidCommand'](player.placeLetter(commandInfo) as PlaceLettersReturn, serverSocket, player.room, EXPECTED_MESSAGE);
        });
    });

    it('exchange() should emit to the room the player information and active player', () => {
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player1);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
        expect(socketManagerStub.emitRoom.calledWithExactly(player1.room, SocketEvents.Play, player1.getInformation(), gameStub.turn.activePlayer));
    });

    it('exchange() should emit a message when a command error occurs', (done) => {
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        clientSocket.on(SocketEvents.ImpossibleCommandError, (message) => {
            expect(message).to.be.equal('Vous ne possédez pas toutes les lettres à échanger');
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player1);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
    });

    it('exchange() should call updatePlayerInfo()', () => {
        const LETTER = [
            { value: 'c', quantity: 2, points: 1 },
            { value: 'r', quantity: 2, points: 1 },
            { value: 'p', quantity: 2, points: 1 },
        ];
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        player.rack = LETTER;
        const updatePlayerInfoStub = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        letterPlacementStub.areLettersInRack.returns(true);
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1]);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, ['c']);
        expect(updatePlayerInfoStub.called).to.be.equal(true);
    });

    it("exchange() shouldn't do anything if the socket doesn't exist call updatePlayerInfo()", () => {
        const LETTER = { value: '' } as Letter;
        const updatePlayerInfoStub = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        gameStub.exchange.returns([LETTER]);
        player1.game = gameStub as unknown as Game;
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
        expect(updatePlayerInfoStub.called).to.be.equal(false);
        expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
    });

    it('playGame() should emit an impossible command', (done) => {
        const RETURNED_STRING = 'suffering';
        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        player.placeLetter.returns(RETURNED_STRING);
        clientSocket.on(SocketEvents.ImpossibleCommandError, (information) => {
            expect(information).to.be.equal(RETURNED_STRING);
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1]);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
    });

    it('playGame() should emit the play info', () => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = true;
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const EXPECTED_INFORMATION = {
            gameboard: [],
            activePlayer: '',
        };

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        player.placeLetter.returns({
            hasPassed: RETURNED_BOOLEAN,
            gameboard: { gameboardTiles: [] } as unknown as Gameboard,
            invalidWords: {} as Word[],
        });

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1]);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(socketManagerStub.emitRoom.calledOnceWithExactly(ROOM, SocketEvents.ViewUpdate, EXPECTED_INFORMATION)).to.be.equal(true);
    });

    it('playGame() should call updatePlayerInfo', () => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = true;
        const updatePlayerInfo = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.placeLetter.returns({
            hasPassed: RETURNED_BOOLEAN,
            gameboard: { gameboardTiles: [] } as unknown as Gameboard,
            invalidWords: [] as Word[],
        });
        player.game = gameStub as unknown as Game;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1]);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(updatePlayerInfo.called).to.be.equal(true);
    });

    it('sendValidCommand() should return an impossible command error if boolean is true', (done) => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = false;
        const EXPECTED_MESSAGE = 'Le mot "' + 'HELLO' + '" ne fait pas partie du dictionnaire français';
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        clientSocket.on(SocketEvents.ImpossibleCommandError, (message) => {
            expect(message).to.equal(EXPECTED_MESSAGE);
            done();
        });

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.placeLetter.returns({
            hasPassed: RETURNED_BOOLEAN,
            gameboard: { gameboardTiles: [] } as unknown as Gameboard,
            invalidWords: [{ stringFormat: 'HELLO' }] as Word[],
        });
        player.game = gameStub as unknown as Game;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player.room, [player]);
        // eslint-disable-next-line dot-notation
        gamesHandler['sendValidCommand'](player.placeLetter(commandInfo) as PlaceLettersReturn, serverSocket, player.room, EXPECTED_MESSAGE);
    });
    it("playGame() shouldn't do anything if the socket.id isn't in players", () => {
        const updatePlayerInfoSpy = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player1.game = gameStub as unknown as Game;

        // eslint-disable-next-line dot-notation
        gamesHandler['gamePlayers'].set(player1.room, [player1]);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(updatePlayerInfoSpy.called).to.not.be.equal(true);
    });

    context('CreateGame() Tests', () => {
        let createNewGameStub: sinon.SinonStub<unknown[], unknown>;
        let setAndGetPlayerStub: sinon.SinonStub<unknown[], unknown>;
        let updatePlayerInfoStub: sinon.SinonStub<unknown[], unknown>;
        let botPlayer: sinon.SinonStubbedInstance<BeginnerBot>;
        let realPlayer: sinon.SinonStubbedInstance<RealPlayer>;

        beforeEach(() => {
            gamesHandler = new GamesHandler(
                socketManagerStub as unknown as SocketManager,
                scoreStorageStub as unknown as ScoreStorageService,
                wordSolverStub as unknown as WordSolverService,
                letterPlacementStub as unknown as LetterPlacementService,
            );
            createNewGameStub = sinon.stub(gamesHandler, 'createNewGame' as never);
            gameInfo.socketId = [serverSocket.id];
            createNewGameStub.returns(game);
            sinon.stub(gamesHandler, 'userConnected' as never);
            updatePlayerInfoStub = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
            setAndGetPlayerStub = sinon.stub(gamesHandler, 'setAndGetPlayer' as never);
            botPlayer = sinon.createStubInstance(BeginnerBot);
            botPlayer.room = ROOM;
            botPlayer.game = game;
            botPlayer.name = 'VINCENT';
            realPlayer = sinon.createStubInstance(RealPlayer);
            realPlayer.room = ROOM;
            realPlayer.game = game;
            realPlayer.name = 'ROBERT';
            setAndGetPlayerStub.onCall(0).returns(realPlayer);
            setAndGetPlayerStub.onCall(1).returns(botPlayer);
        });

        afterEach(() => {
            sinon.restore();
            game.turn.countdown.unsubscribe();
            game.turn.endTurn.unsubscribe();
        });
        it('CreateGame() should call setAndGetPlayer()', (done) => {
            gameInfo.socketId[1] = '3249adf8243';
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(setAndGetPlayerStub.called).to.equal(true);
            done();
        });

        it('CreateGame() should call initializePlayers()', (done) => {
            const initializePlayersStub = sinon.stub(gamesHandler, 'initializePlayers' as never);
            gameInfo.socketId[1] = '3249adf8243';
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(initializePlayersStub.called).to.equal(true);
            done();
        });

        it('CreateGame() should call updatePlayerInfo when you are the player creating the game()', (done) => {
            gameInfo.socketId[1] = '3249adf8243';
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(updatePlayerInfoStub.called).to.equal(true);
            done();
        });

        it('initializePlayers() should call the setGame and the start function of the player when you are playing against a bot', (done) => {
            // eslint-disable-next-line dot-notation
            gamesHandler['initializePlayers']([realPlayer, botPlayer], botPlayer.game, [serverSocket.id]);

            expect(realPlayer.setGame.called).to.equal(true);
            expect(botPlayer.setGame.called).to.equal(true);
            expect(botPlayer.start.called).to.equal(true);
            done();
        });

        it('CreateGame() should call createNewGame()', () => {
            gameInfo.socketId[1] = '3249adf8243';
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(createNewGameStub.called).to.equal(true);
        });

        it('CreateGame() should call endGameScore() and changeTurn() when the turn end ', () => {
            gameInfo.socketId[1] = '3249adf8243';
            const endGameScore = sinon.stub(gamesHandler, 'endGameScore' as never);
            const changeTurn = sinon.stub(gamesHandler, 'changeTurn' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            game.turn.endTurn.next(player1.name);
            expect(endGameScore.called).to.equal(true);
            expect(changeTurn.called).to.equal(true);
        });

        it('CreateGame() should call sendTimer() when the countdown change value ', () => {
            player1.name = 'Vincent';
            gameInfo.socketId[1] = '3249adf8243';
            const sendTimer = sinon.stub(gamesHandler, 'sendTimer' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            game.turn.countdown.next(1);
            expect(sendTimer.called).to.equal(true);
        });

        it('CreateGame() should emit game information to the room', () => {
            gameInfo.socketId[1] = '3249adf8243';
            player1.room = ROOM;
            serverSocket.join(ROOM);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(
                socketManagerStub.emitRoom.calledWithExactly(gameInfo.roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve),
            ).to.be.equal(true);
        });
    });

    context('endGame() Tests', () => {
        it('endGame() should emit a event to the client when the game is not already finished and we need to post endGame information', (done) => {
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            player.game = gameHolderTest as unknown as Game;
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player.room, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGame'](serverSocket.id);

            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.GameEnd));
            done();
        });

        it('endGame() should emit a event to the client when the game is already finished and we need to post endGame information', (done) => {
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            gameHolderTest.isGameFinish = true;
            player.game = gameHolderTest as unknown as Game;
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['gamePlayers'].set(player.room, [player]);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGame'](serverSocket.id);

            expect(socketManagerStub.emitRoom.notCalled).to.be.equal(true);
            done();
        });
    });
});
