import { GamesHandler } from '@app/services/games-handler.service';
import { expect } from 'chai';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import * as sinon from 'sinon';
import { Server as ioServer, Socket as ServerSocket } from 'socket.io';
import { io as Client, Socket } from 'socket.io-client';
import { SocketManager } from './socket-manager.service';

type SioSignature = SocketManager['sio'];

describe.only('GamesHandler Service', () => {
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
});
