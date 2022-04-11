/* eslint-disable @typescript-eslint/no-empty-function*/
/* eslint-disable dot-notation*/
import { Game } from '@app/classes/game.class';
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterReserve } from '@app/classes/letter-reserve.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn.class';
import { DictionaryStorageService } from '@app/services/database/dictionary-storage.service';
import { GamesHandler } from '@app/services/games-management/games-handler.service';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ReplaySubject } from 'rxjs';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';

const ROOM = '0';
const DICTIONARIES = [
    { title: 'Premier dictonnaire', description: 'Un dictionnaire', words: ['string'] },
    { title: 'Deuxième dictonnaire', description: 'Un dictionnaire', words: ['string'] },
    { title: 'Troisième dictonnaire', description: 'Un dictionnaire', words: ['string'] },
];

describe('GamesHandler Service', () => {
    let gamesHandler: GamesHandler;
    let socketManagerStub: sinon.SinonStubbedInstance<SocketManager>;
    let dictionaryStorageStub: sinon.SinonStubbedInstance<DictionaryStorageService>;

    let httpServer: Server;
    let clientSocket: Socket;
    let serverSocket: ServerSocket;
    let port: number;
    let sio: ioServer;

    let game: sinon.SinonStubbedInstance<Game> & Game;

    beforeEach((done) => {
        socketManagerStub = sinon.createStubInstance(SocketManager);
        socketManagerStub.emitRoom.callsFake(() => {});
        dictionaryStorageStub = sinon.createStubInstance(DictionaryStorageService);

        game = sinon.createStubInstance(Game) as sinon.SinonStubbedInstance<Game> & Game;
        game.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        game.letterReserve = new LetterReserve();
        game.letterReserve.lettersReserve = [{ value: 'c', quantity: 2, points: 1 }];
        game.gameboard = sinon.createStubInstance(Gameboard);

        gamesHandler = new GamesHandler(socketManagerStub as unknown as SocketManager, dictionaryStorageStub as unknown as DictionaryStorageService);

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
            playerOne.isPlayerOne = false;
            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);

            gamesHandler['updatePlayerInfo'](serverSocket, ROOM, game);
        });

        it('updatePlayerInfo() should broadcast correct info to the first Player when we play with a bot', (done) => {
            secondSocket.on(SocketEvents.UpdateOpponentInformation, (information) => {
                expect(information).to.be.eql(playerOne.getInformation());
                done();
            });
            secondSocket.on(SocketEvents.UpdatePlayerInformation, (information) => {
                expect(information).to.be.eql(playerTwo.getInformation());
            });
            playerOne.isPlayerOne = true;
            gamesHandler['gamePlayers'].set(playerOne.room, [playerOne, playerTwo]);

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

        it("updatePlayerInfo() shouldn't do anything if the players are undefined", () => {
            gamesHandler['players'].set(serverSocket.id, playerOne);

            gamesHandler['gamePlayers'].set(playerOne.room, undefined as unknown as Player[]);

            gamesHandler['updatePlayerInfo'](serverSocket, playerOne.room, playerOne.game);
            expect(socketManagerStub.emitRoom.called).to.not.be.equal(true);
        });
    });

    it('setDictionaries() should call getAllDictionary of DictionaryStorage', async () => {
        dictionaryStorageStub.getAllDictionary.resolves(DICTIONARIES);
        await gamesHandler.setDictionaries();
        expect(dictionaryStorageStub.getAllDictionary.called).to.equal(true);
    });

    it('setDictionaries() should set dictionaries attribute', async () => {
        dictionaryStorageStub.getAllDictionary.resolves(DICTIONARIES);
        await gamesHandler.setDictionaries();
        expect(gamesHandler['dictionaries'].size).to.be.greaterThan(0);
    });
});
