import { assert } from 'console';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { SocketSubscribeHandler } from './socket-subscribe-handler.service';

describe('Socket subscribe handler tests', () => {
    let chatboxHandlerService: SinonStubbedInstance<ChatboxHandlerService>;
    let socketSubscribeHandler: SocketSubscribeHandler;

    beforeEach(async () => {
        chatboxHandlerService = createStubInstance(ChatboxHandlerService);
        chatboxHandlerService.initSocketsEvents.resolves();
        socketSubscribeHandler = new SocketSubscribeHandler(chatboxHandlerService as unknown as ChatboxHandlerService);
    });

    it('initSocketsEvents() should subscribe the rest of the services that uses sockets', () => {
        socketSubscribeHandler.initSocketsEvents();
        assert(chatboxHandlerService.initSocketsEvents.calledOnce);
    });
});
