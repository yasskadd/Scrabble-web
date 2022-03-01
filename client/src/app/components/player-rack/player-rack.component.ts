import { Component } from '@angular/core';
import * as constants from '@app/constants';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { Letter } from '@common/letter';

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent {
    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    constructor(private chatBoxHandler: ChatboxHandlerService, public gameClient: GameClientService, private tmpService: GridService) {}
    get letterSize(): number {
        return this.tmpService.letterSize;
    }
    get pointsSize(): number {
        return this.tmpService.letterSize * constants.LETTER_WEIGHT_RATIO;
    }
    get rack(): Letter[] {
        return this.gameClient.playerOne.rack;
    }

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }
}
