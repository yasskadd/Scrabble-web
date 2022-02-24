import { Component } from '@angular/core';
import * as constants from '@app/constants';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent {
    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    constructor(private chatBoxHandler: ChatboxHandlerService, public gameClient: GameClientService) {}

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }
}
