import { Component } from '@angular/core';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';

export const DEFAULT_WIDTH = 300;
export const DEFAULT_HEIGHT = 45;

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent {
    constructor(private chatBoxHandler: ChatboxHandlerService, public gameClient: GameClientService) {}

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }
}
