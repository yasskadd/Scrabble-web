import { Service } from 'typedi';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameSessions } from './game-sessions.service';
import { GameSocket } from './games-handler.service';
@Service()
export class SocketSubscribeHandler {
    constructor(private chatBoxHandlerService: ChatboxHandlerService, private gameSessions: GameSessions, private gameSockets: GameSocket) {}

    initSocketsEvents() {
        this.gameSessions.initSocketEvents();
        this.chatBoxHandlerService.initSocketsEvents();
        this.gameSockets.initSocketsEvents();
        // Ajouter le reste des services qui utilisent des sockets ici!
    }
}
