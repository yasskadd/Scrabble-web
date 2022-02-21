import { Service } from 'typedi';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameSessions } from './game-sessions.service';
import { GamesHandler } from './games-handler.service';

@Service()
export class SocketSubscribeHandler {
    constructor(private chatBoxHandlerService: ChatboxHandlerService, private gameSessions: GameSessions, private gameHandler: GamesHandler) {}

    initSocketsEvents() {
        this.gameSessions.initSocketEvents();
        this.chatBoxHandlerService.initSocketsEvents();
        this.gameHandler.initSocketsEvents();
    }
}
