import { SocketEvents } from '@common/socket-events';
import { expect } from 'chai';
import { createServer, Server as HttpServer } from 'http';
// import { AddressInfo } from 'net';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import { Server, Socket } from 'socket.io';
// import { io as Client } from 'socket.io-client';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { SocketManager } from './socket-manager.service';

describe('Chatbox handler service tests', () => {
    let socketManagerStub: SinonStubbedInstance<SocketManager>;
    let chatboxHandlerService: ChatboxHandlerService;
    let httpServer: HttpServer;
    // let io: Server;
    // let clientSocket: Socket;

    beforeEach(() => {
        socketManagerStub = createStubInstance(SocketManager);
        socketManagerStub.on.resolves();
        chatboxHandlerService = new ChatboxHandlerService(socketManagerStub as unknown as SocketManager);

        httpServer = createServer();
        httpServer.listen();
    });

    it('initSocketsEvents() should call the subscribe from the socket Manager', () => {
        chatboxHandlerService.initSocketsEvents();
        // Reason : checking if private method has been called
        // eslint-disable-next-line dot-notation
        expect(socketManagerStub.on.calledOnceWithExactly(SocketEvents.SendMessage, chatboxHandlerService['sendMessage']));
        // Reason : checking if private method has been called
        // eslint-disable-next-line dot-notation
        expect(socketManagerStub.on.calledOnceWithExactly(SocketEvents.Disconnect, chatboxHandlerService['disconnectEvent']));
    });

    // TODO : it('sendMessage() should send a message to the socket with the socket.id', () => {
    //     const TEST_MESSAGE = '4AM here -_-';
    //     // Reason : checking if private method has been called
    //     // eslint-disable-next-line dot-notation
    //     const socket = chatboxHandlerService.sendMessage(clientSocket,TEST_MESSAGE);
    // });
});
