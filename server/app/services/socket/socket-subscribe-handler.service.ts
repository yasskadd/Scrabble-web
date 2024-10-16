import { ChatboxHandlerService } from '@app/services/client-utilities/chatbox-handler.service';
import { GameSessions } from '@app/services/client-utilities/game-sessions.service';
import { GamesActionsService } from '@app/services/games-management/games-actions.service';
import { GamesStateService } from '@app/services/games-management/games-state.service';
import { Service } from 'typedi';

@Service()
export class SocketSubscribeHandler {
    constructor(
        private chatBoxHandlerService: ChatboxHandlerService,
        private gameSessions: GameSessions,
        private gameActions: GamesActionsService,
        private gamesState: GamesStateService,
    ) {}

    initSocketsEvents() {
        this.gameSessions.initSocketEvents();
        this.chatBoxHandlerService.initSocketsEvents();
        this.gameActions.initSocketsEvents();
        this.gamesState.initSocketsEvents();
    }
}
