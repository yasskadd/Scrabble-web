import { ChatboxHandlerService } from '@app/services/client-utilities/chatbox-handler.service';
import { GameSessions } from '@app/services/client-utilities/game-sessions.service';
import { GamesHandler } from '@app/services/games-handler.service';
import { Service } from 'typedi';

@Service()
export class SocketSubscribeHandler {
    constructor(private chatBoxHandlerService: ChatboxHandlerService, private gameSessions: GameSessions, private gameHandler: GamesHandler) {}

    initSocketsEvents() {
        this.gameSessions.initSocketEvents();
        this.chatBoxHandlerService.initSocketsEvents();
        this.gameHandler.initSocketsEvents();
    }
}
