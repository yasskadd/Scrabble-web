/* eslint-disable max-lines */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/command-info';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { GamesHandler } from '@app/services/games-handler.service';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { Observable } from 'rxjs';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { Game } from './game.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';

interface GameHolder {
    game: Game | undefined;
    players: RealPlayer[];
    roomId: string;
    isGameFinish: boolean;
    timer: number;
}

const ROOM = '0';
describe.only('GamesHandler Service', () => {
    let gamesHandler: GamesHandler;
    let scoreStorageStub: sinon.SinonStubbedInstance<ScoreStorageService>;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: ioServer;
    let gameInfo: { playerName: string[]; roomId: string; timer: number; socketId: string[] };

    beforeEach((done) => {
        socketManagerStub = sinon.createStubInstance(SocketManager);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        socketManagerStub.emitRoom.callsFake(() => {});

        scoreStorageStub = sinon.createStubInstance(ScoreStorageService);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        scoreStorageStub.addTopScores.callsFake(async (): Promise<void> => {});
        gamesHandler = new GamesHandler(socketManagerStub as unknown as SocketManager, scoreStorageStub as unknown as ScoreStorageService);

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

        gamesHandler.initSocketsEvents();
        const CALL_NUMBER = 8;
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
        expect(socketManagerStub.on.called).to.equal(true);

        done();
    });

    it('reserveCommand() should emit the reserve to the client ', (done) => {
        const player = { room: ROOM } as Player;
        const game = sinon.createStubInstance(Game);
        game.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
        game.turn = { activePlayer: '' } as Turn;
        game.letterReserve = {
            lettersReserve: [
                { value: 'c', quantity: 2, points: 1 },
                { value: 'r', quantity: 2, points: 1 },
                { value: 'p', quantity: 2, points: 1 },
            ],
        } as LetterReserveService;
        game.skip.returns(true);
        const gameHolder = { game, players: [], isGameFinish: false };
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);

        clientSocket.on(SocketEvents.AllReserveLetters, (information) => {
            expect(information).to.be.eql(game.letterReserve.lettersReserve);
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['reserveCommand'](serverSocket);
    });

    it('skip() should call player.skipTurn()', (done) => {
        const player = sinon.createStubInstance(RealPlayer);
        const game = sinon.createStubInstance(Game);
        game.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
        game.turn = { activePlayer: '' } as Turn;
        game.skip.returns(true);
        const gameHolder = { game, players: [] as RealPlayer[], isGameFinish: false };
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);

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
        const player1 = { name: 'Vincent', room: ROOM, score: 40 } as Player;
        const player2 = { name: 'Bob', room: ROOM, score: 70 } as Player;
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
        const player1 = { name: 'Vincent', room: ROOM, score: 40 } as Player;
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
        const player2 = { name: 'Vincent', room: ROOM, score: 40 } as Player;
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

    it("changeTurn() should send the game's information when called and the active player isn't undefined", () => {
        const game = {
            gameboard: { gameboardCoords: [] },
            turn: { activePlayer: true },
        } as unknown as Game;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const gameHolder = { game, players: [{ getInformation: () => {} }, { getInformation: () => {} }] } as unknown as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);

        // eslint-disable-next-line dot-notation
        gamesHandler['changeTurn'](ROOM);

        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.Skip, game));
    });
    it('changeTurn() should emit that the game ended when the active player is undefined', () => {
        const game = {
            gameboard: { gameboardCoords: [] },
            turn: { activePlayer: false },
        } as unknown as Game;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const gameHolder = { game, players: [{ getInformation: () => {} }, { getInformation: () => {} }] } as unknown as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);

        // eslint-disable-next-line dot-notation
        gamesHandler['changeTurn'](ROOM);

        expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.GameEnd));
    });

    it('createNewGame() should return a new game created', () => {
        const TIMER = 60;
        const FIRST_PLAYER = 'ISKANDAR';
        const SECOND_PLAYER = 'GILGAMESH';
        const PLAYER_ONE = new RealPlayer(FIRST_PLAYER);
        const PLAYER_TWO = new RealPlayer(SECOND_PLAYER);

        const params = {
            game: {} as Game,
            players: [PLAYER_ONE, PLAYER_TWO],
            roomId: ROOM,
            isGameFinish: false,
            timer: TIMER,
        };
        // eslint-disable-next-line dot-notation
        const game = gamesHandler['createNewGame'](params);
        expect(game !== undefined).to.eql(true);
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
        const game = {
            letterReserve: RESERVE,
        } as unknown as Game;
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
            const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder);
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
            const gameHolder = { players: [playerOne, playerTwo], roomId: ROOM, isGameFinish: true };
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
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
            const gameHolder = { players: [playerOne, playerTwo], roomId: ROOM, isGameFinish: true };
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
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
            const gameHolder = { players: [playerOne, playerTwo], roomId: ROOM, isGameFinish: true };
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
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
            const gameHolder = { players: undefined, roomId: ROOM, isGameFinish: true };
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
            expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
        });
        it('disconnect() should emit to the room that the opponent left/ game ended after 5 seconds of waiting for a reconnect', (done) => {
            const player = new Player('Jean');
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            const gameHolder = { gameHolderTest, players: [player], roomId: ROOM, isGameFinish: false };

            const timeOut5Seconds = 5500;

            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['disconnect'](serverSocket);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            setTimeout(() => {
                expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.OpponentGameLeave)).to.be.equal(true);
                expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.UserDisconnect)).to.be.equal(true);
                done();
            }, timeOut5Seconds);
        });
        it("disconnect() shouldn't emit to the room that the opponent left/ game ended after 5 seconds of waiting for a reconnect", (done) => {
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
            setTimeout(() => {
                expect(testBoolean1).to.be.equal(false);
                expect(testBoolean2).to.be.equal(false);
                done();
            }, timeOut5Seconds);
        });

        it('disconnect() should emit to the room that the opponent left when the game is already finish', (done) => {
            const player = new Player('Jean');
            player.room = ROOM;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            const gameHolder = { gameHolderTest, players: [player], roomId: ROOM, isGameFinish: true };

            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['disconnect'](serverSocket);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            expect(socketManagerStub.emitRoom.called).to.be.equal(true);
            done();
        });
        it('playGame() should send to the other player the command inputed', (done) => {
            serverSocket.join(ROOM);
            const RETURNED_BOOLEAN = true;
            const EXPECTED_MESSAGE = '!placer `0v ';
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

            const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[], direction: 'v' } as unknown as CommandInfo;
            const player = sinon.createStubInstance(RealPlayer);
            player.name = '';
            player.room = ROOM;
            const gameStub = sinon.createStubInstance(Game);

            clientSocket.on(SocketEvents.GameMessage, (message) => {
                expect(message).to.equal(EXPECTED_MESSAGE);
                done();
            });

            gameStub.turn = { activePlayer: '' } as unknown as Turn;
            player.placeLetter.returns([RETURNED_BOOLEAN, { gameboardCoords: [] } as unknown as Gameboard]);
            const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
            player.game = gameStub as unknown as Game;

            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['playGame'](serverSocket, commandInfo);
        });
    });
    it('exchange() should emit to the room the player information and active player', () => {
        const LETTER = { value: 'LaStructureDuServeur' } as Letter;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        player.rack = [LETTER];
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
        expect(socketManagerStub.emitRoom.calledWithExactly(player.room, SocketEvents.Play, player.getInformation(), gameStub.turn.activePlayer));
    });

    it('exchange() should emit a message when a command error occurs', (done) => {
        const LETTER = { value: 'LaStructureDuServeur' } as Letter;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        player.rack = [LETTER];
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        clientSocket.on(SocketEvents.ImpossibleCommandError, (message) => {
            expect(message).to.be.equal('Vous ne posséder pas toutes les lettres a échanger');
            done();
        });
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
    });
    it('exchange() should call updatePlayerInfo()', () => {
        const LETTER = { value: '' } as Letter;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        player.rack = [LETTER];
        const updatePlayerInfoStub = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
        expect(updatePlayerInfoStub.called).to.be.equal(true);
    });
    it("exchange() shouldn't do anything if the socket doesn't exist call updatePlayerInfo()", () => {
        const LETTER = { value: '' } as Letter;
        const updatePlayerInfoStub = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const gameStub = sinon.createStubInstance(Game);
        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        gameStub.exchange.returns([LETTER]);
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['exchange'](serverSocket, []);
        expect(updatePlayerInfoStub.called).to.be.equal(false);
        expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
    });

    it('playGame() should emit an impossible command', (done) => {
        const RETURNED_STRING = 'suffering';
        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        player.placeLetter.returns([RETURNED_STRING as never, { gameboardCoords: [] } as unknown as Gameboard]);
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;
        clientSocket.on(SocketEvents.ImpossibleCommandError, (information) => {
            expect(information[0]).to.be.equal(RETURNED_STRING);
            done();
        });
        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
    });

    it('playGame() should emit playerInfo', () => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = true;
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
        const EXPECTED_INFORMATION = {
            gameboard: [],
            activePlayer: '',
        };

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.game = gameStub as unknown as Game;
        player.placeLetter.returns([RETURNED_BOOLEAN, { gameboardCoords: [] } as unknown as Gameboard]);
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(socketManagerStub.emitRoom.calledOnceWithExactly(ROOM, SocketEvents.ViewUpdate, EXPECTED_INFORMATION)).to.be.equal(true);
    });

    it('playGame() should call updatePlayerInfo', () => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = true;
        const updatePlayerInfo = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.placeLetter.returns([RETURNED_BOOLEAN, { gameboardCoords: [] } as unknown as Gameboard]);
        player.game = gameStub as unknown as Game;
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(updatePlayerInfo.called).to.be.equal(true);
    });

    it('playGame() should return an impossible command error if boolean is true', (done) => {
        serverSocket.join(ROOM);
        const RETURNED_BOOLEAN = false;
        const EXPECTED_MESSAGE = 'Les lettres que vous essayer de mettre ne forme pas des mots valides';
        sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[] } as unknown as CommandInfo;
        const player = sinon.createStubInstance(RealPlayer);
        player.name = '';
        player.room = ROOM;
        const gameStub = sinon.createStubInstance(Game);

        clientSocket.on(SocketEvents.ImpossibleCommandError, (message) => {
            expect(message).to.equal(EXPECTED_MESSAGE);
            done();
        });

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        player.placeLetter.returns([RETURNED_BOOLEAN, { gameboardCoords: [] } as unknown as Gameboard]);
        player.game = gameStub as unknown as Game;
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;

        // eslint-disable-next-line dot-notation
        gamesHandler['players'].set(serverSocket.id, player);
        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
    });
    it("playGame() shouldn't do anything if the socket.id isn't in players", () => {
        const updatePlayerInfoSpy = sinon.stub(gamesHandler, 'updatePlayerInfo' as never);

        const commandInfo = { firstCoordinate: { x: 0, y: 0 }, lettersPlaced: [] as string[] } as unknown as CommandInfo;
        const gameStub = sinon.createStubInstance(Game);

        gameStub.turn = { activePlayer: '' } as unknown as Turn;
        const gameHolder = { game: gameStub as unknown as Game } as GameHolder;

        // eslint-disable-next-line dot-notation
        gamesHandler['games'].set(ROOM, gameHolder);
        // eslint-disable-next-line dot-notation
        gamesHandler['playGame'](serverSocket, commandInfo);
        expect(updatePlayerInfoSpy.called).to.not.be.equal(true);
    });
    context('CreateGame() Tests', () => {
        let createNewGameStub: sinon.SinonStub<unknown[], unknown>;
        beforeEach(() => {
            gamesHandler = new GamesHandler(socketManagerStub as unknown as SocketManager, scoreStorageStub as unknown as ScoreStorageService);
            createNewGameStub = sinon.stub(gamesHandler, 'createNewGame' as never);
            const gameStub = {
                letterReserve: { lettersReserve: [] },
                turn: { endTurn: new Observable(), countdown: new Observable() },
                gameboard: { gameboardCoords: [] },
            };
            createNewGameStub.returns(gameStub);
            sinon.stub(gamesHandler, 'updatePlayerInfo' as never);
            sinon.stub(gamesHandler, 'userConnected' as never);
            sinon.stub(gamesHandler, 'sendTimer' as never);
        });
        it('CreateGame() should call setAndGetPlayer()', (done) => {
            const setAndGetPlayer = sinon.spy(gamesHandler, 'setAndGetPlayer' as never);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(setAndGetPlayer.called).to.equal(true);
            done();
        });
        it('CreateGame() should call createNewGame()', (done) => {
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            expect(createNewGameStub.called).to.equal(true);
            done();
        });
        it('CreateGame() should emit game information to the room', () => {
            serverSocket.join(ROOM);
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            const gameStub = {
                letterReserve: { lettersReserve: [] },
                turn: { endTurn: new Observable(), countdown: new Observable() },
                gameboard: { gameboardCoords: [] },
            };
            expect(
                socketManagerStub.emitRoom.calledWithExactly(
                    gameInfo.roomId,
                    SocketEvents.LetterReserveUpdated,
                    gameStub.letterReserve.lettersReserve,
                ),
            ).to.be.equal(true);
        });
        it('CreateGame() should add the game to the game Map', () => {
            // eslint-disable-next-line dot-notation
            gamesHandler['createGame'](serverSocket, gameInfo);
            // eslint-disable-next-line dot-notation
            expect(gamesHandler['games'].get(ROOM)).to.not.equal(undefined);
        });
    });

    context('endGame() Tests', () => {
        it('endGame() should emit a event to the client when the game is not already finished and we need to post endGame information', (done) => {
            const player = { name: 'Marc', room: ROOM } as unknown as Player;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            const gameHolder = { gameHolderTest, players: [player], roomId: ROOM, isGameFinish: false };
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGame'](serverSocket.id);

            expect(socketManagerStub.emitRoom.calledWith(ROOM, SocketEvents.GameEnd));
            done();
        });

        it('endGame() should emit a event to the client when the game is already finished and we need to post endGame information', (done) => {
            const player = { name: 'Marc', room: ROOM } as unknown as Player;
            const gameHolderTest = sinon.createStubInstance(Game);
            gameHolderTest.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
            gameHolderTest.turn = { activePlayer: '' } as Turn;
            gameHolderTest.skip.returns(true);
            const gameHolder = { gameHolderTest, players: [player], roomId: ROOM, isGameFinish: true };
            // eslint-disable-next-line dot-notation
            gamesHandler['players'].set(serverSocket.id, player);
            // eslint-disable-next-line dot-notation
            gamesHandler['games'].set(ROOM, gameHolder as unknown as GameHolder);
            // eslint-disable-next-line dot-notation
            gamesHandler['endGame'](serverSocket.id);

            expect(socketManagerStub.emitRoom.notCalled).to.be.equal(true);
            done();
        });
    });
});
