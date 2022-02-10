import { assert } from 'console';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameSessions } from './game-sessions.service';
import { GameSocket } from './game-socket.service';
import { SocketSubscribeHandler } from './socket-subscribe-handler.service';

describe('Socket subscribe handler tests', () => {
    let chatboxHandlerService: SinonStubbedInstance<ChatboxHandlerService>;
    let gameSessionsHandlerService: SinonStubbedInstance<GameSessions>;
    let socketSubscribeHandler: SocketSubscribeHandler;
    let gameSockets: SinonStubbedInstance<GameSocket>;

    beforeEach(async () => {
        chatboxHandlerService = createStubInstance(ChatboxHandlerService);
        chatboxHandlerService.initSocketsEvents.resolves();
        gameSessionsHandlerService = createStubInstance(GameSessions);
        gameSessionsHandlerService.initSocketEvents.resolves();
        socketSubscribeHandler = new SocketSubscribeHandler(
            chatboxHandlerService as unknown as ChatboxHandlerService,
            gameSessionsHandlerService as unknown as GameSessions,
            gameSockets as unknown as GameSocket,
        );
    });

    it('initSocketsEvents() should subscribe the rest of the services that uses sockets', () => {
        socketSubscribeHandler.initSocketsEvents();
        assert(chatboxHandlerService.initSocketsEvents.calledOnce);
        assert(gameSessionsHandlerService.initSocketEvents.calledOnce);
    });
});
