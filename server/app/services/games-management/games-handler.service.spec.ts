/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function*/
/* eslint-disable dot-notation*/
import { Game } from '@app/classes/game';
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterReserve } from '@app/classes/letter-reserve';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { PlaceLettersReturn } from '@app/interfaces/place-letters-return';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { GamesHandler } from '@app/services/games-management/games-handler.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { SocketEvents } from '@common/constants/socket-events';
import { CommandInfo } from '@common/interfaces/command-info';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ReplaySubject } from 'rxjs';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';

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
    let gameInfo: { playerName: string[]; roomId: string; timer: number; socketId: string[]; mode: string; botDifficulty?: string };
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

        socketManagerStub = sinon.createStubInstance(SocketManager);
        socketManagerStub.emitRoom.callsFake(() => {});

        letterPlacementStub = sinon.createStubInstance(LetterPlacementService);

        scoreStorageStub = sinon.createStubInstance(ScoreStorageService);
        scoreStorageStub.addTopScores.callsFake(async (): Promise<void> => {});

        wordSolverStub = sinon.createStubInstance(WordSolverService);

        wordSolverStub.setGameboard.callsFake(() => {});

        wordSolverStub.findAllOptions.callsFake((): CommandInfo[] => {
            return [];
        });

        game = sinon.createStubInstance(Game) as sinon.SinonStubbedInstance<Game> & Game;
        game.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        game.letterReserve = new LetterReserve();
        game.letterReserve.lettersReserve = [{ value: 'c', quantity: 2, points: 1 }];
        game.gameboard = sinon.createStubInstance(Gameboard);

        player1.game = game;
        gamesHandler = new GamesHandler(
            socketManagerStub as unknown as SocketManager,
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
                gameInfo = { playerName: [], roomId: ROOM, timer: 0, socketId: [serverSocket.id], mode: 'Classique', botDifficulty: undefined };
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
        } as LetterReserve;

        gamesHandler['players'].set(serverSocket.id, player1);

        clientSocket.on(SocketEvents.AllReserveLetters, (information) => {
            expect(information).to.be.eql(game.letterReserve.lettersReserve);
            done();
        });

        gamesHandler['reserveCommand'](serverSocket);
    });

    it("reserveCommand() shouldn't do anything if the socketID is invalid ", () => {
        const TIME_TO_RECEIVE_EVENT = 500;
        const clock = sinon.useFakeTimers();
        player1.game.letterReserve = {
            lettersReserve: [
                { value: 'c', quantity: 2, points: 1 },
                { value: 'r', quantity: 2, points: 1 },
                { value: 'p', quantity: 2, points: 1 },
            ],
        } as LetterReserve;
        let testBoolean = true;
        clientSocket.on(SocketEvents.AllReserveLetters, () => {
            testBoolean = false;
        });

        gamesHandler['reserveCommand'](serverSocket);
        clock.tick(TIME_TO_RECEIVE_EVENT);
        clock.restore();
        expect(testBoolean).to.be.eql(true);
    });

    it('clueCommand() should call wordSolver.setGameboard,  findAllOptions  and configureClueCommand', () => {
        const configureClueCommandSpy = sinon.spy(gamesHandler, 'configureClueCommand' as never);

        gamesHandler['players'].set(serverSocket.id, player1);

        gamesHandler['clueCommand'](serverSocket);

        expect(wordSolverStub.setGameboard.called).to.equal(true);
        expect(wordSolverStub.findAllOptions.called).to.equal(true);
        expect(configureClueCommandSpy.called).to.equal(true);
    });

    it('configureClueCommand() should return an array with the one placement possible when there is only one available ', (done) => {
        const placementPossible = [
            { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: ['p', 'a', 'r'] as string[], direction: 'v' } as unknown as CommandInfo,
        ];

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['skip'](serverSocket);
        expect(player.skipTurn.called).to.equal(true);
        done();
    });

    it('skip() should not call player.skipTurn() when the socketID is invalid', (done) => {
        const player = sinon.createStubInstance(RealPlayer);
        const gameStub = sinon.createStubInstance(Game);

        gameStub.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
        gameStub.turn = { activePlayer: '' } as Turn;
        gameStub.skip.returns(true);

        gamesHandler['skip'](serverSocket);
        expect(player.skipTurn.called).to.equal(false);
        done();
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

            gamesHandler['players'].set(serverSocket.id, player);

            gamesHandler['gamePlayers'].set(player.room, [player]);

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

            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);

            gamesHandler['players'].set(serverSocket.id, playerOne);

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

            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);

            gamesHandler['players'].set(serverSocket.id, playerOne);

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

            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);

            gamesHandler['players'].set(serverSocket.id, playerOne);

            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
        });

        it('updatePlayerInfo() should emit the letterReserve to the room', () => {
            gamesHandler['players'].set(serverSocket.id, playerOne);

            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.LetterReserveUpdated, RESERVE));
        });

        it("updatePlayerInfo() shouldn't do anything if the players are undefined", () => {
            gamesHandler['players'].set(serverSocket.id, playerOne);

            gamesHandler['gamePlayers'].set(playerOne.room, undefined as unknown as Player[]);

            gamesHandler['updatePlayerInfo'](serverSocket, playerOne.room, playerOne.game);
            expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
        });

        it('playGame() should call sendValidCommand when direction is vertical', () => {
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

            gamesHandler['players'].set(serverSocket.id, player);

            gamesHandler['gamePlayers'].set(ROOM, [player]);

            gamesHandler['playGame'](serverSocket, commandInfo);
            expect(sendValidCommandStub.called).to.equal(true);
        });

        it('playGame() should call sendValidCommand when direction is horizontal', () => {
            const sendValidCommandStub = sinon.stub(gamesHandler, 'sendValidCommand' as never);
            serverSocket.join(ROOM);
            const RETURNED_BOOLEAN = true;
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
            const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[], isHorizontal: true } as unknown as CommandInfo;
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

            gamesHandler['players'].set(serverSocket.id, player);

            gamesHandler['gamePlayers'].set(ROOM, [player]);

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

            gamesHandler['players'].set(serverSocket.id, player);

            gamesHandler['gamePlayers'].set(ROOM, [player]);

            gamesHandler['sendValidCommand'](player.placeLetter(commandInfo) as PlaceLettersReturn, serverSocket, player.room, EXPECTED_MESSAGE);
        });
    });

    it('exchange() should emit to the room the player information and active player', () => {
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;

        gamesHandler['players'].set(serverSocket.id, player1);

        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);

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

        gamesHandler['players'].set(serverSocket.id, player1);

        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['gamePlayers'].set(player1.room, [player1]);

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

        gamesHandler['gamePlayers'].set(player1.room, [player1, player2]);

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['gamePlayers'].set(player1.room, [player1]);

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['gamePlayers'].set(player1.room, [player1]);

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['gamePlayers'].set(player1.room, [player1]);

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

        gamesHandler['players'].set(serverSocket.id, player);

        gamesHandler['gamePlayers'].set(player.room, [player]);

        gamesHandler['sendValidCommand'](player.placeLetter(commandInfo) as PlaceLettersReturn, serverSocket, player.room, EXPECTED_MESSAGE);
    });
    it("playGame() shouldn't do anything if the socket.id isn't in players", () => {
        const updatePlayerInfoSpy = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, letters: [] as string[] } as unknown as CommandInfo;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player1.game = gameStub as unknown as Game;

        gamesHandler['gamePlayers'].set(player1.room, [player1]);

        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(updatePlayerInfoSpy.called).to.not.be.equal(true);
    });
});
