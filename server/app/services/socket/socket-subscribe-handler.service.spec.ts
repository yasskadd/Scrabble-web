import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameSessions } from '@app/services/game-sessions.service';
import { GamesHandler } from '@app/services/games-handler.service';
import { assert } from 'console';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { SocketSubscribeHandler } from './socket-subscribe-handler.service';

describe('Socket subscribe handler tests', () => {
    let chatboxHandlerService: SinonStubbedInstance<ChatboxHandlerService>;
    let gameSessionsHandlerService: SinonStubbedInstance<GameSessions>;
    let socketSubscribeHandler: SocketSubscribeHandler;
    let gamesHandler: SinonStubbedInstance<GamesHandler>;

    beforeEach(async () => {
        chatboxHandlerService = createStubInstance(ChatboxHandlerService);
        chatboxHandlerService.initSocketsEvents.resolves();
        gameSessionsHandlerService = createStubInstance(GameSessions);
        gameSessionsHandlerService.initSocketEvents.resolves();
        gamesHandler = createStubInstance(GamesHandler);
        gamesHandler.initSocketsEvents.resolves();
        socketSubscribeHandler = new SocketSubscribeHandler(
            chatboxHandlerService as unknown as ChatboxHandlerService,
            gameSessionsHandlerService as unknown as GameSessions,
            gamesHandler as unknown as GamesHandler,
        );
    });

    it('initSocketsEvents() should subscribe the rest of the services that uses sockets', () => {
        socketSubscribeHandler.initSocketsEvents();
        assert(chatboxHandlerService.initSocketsEvents.calledOnce);
        assert(gameSessionsHandlerService.initSocketEvents.calledOnce);
        assert(gamesHandler.initSocketsEvents.calledOnce);
    });
});
