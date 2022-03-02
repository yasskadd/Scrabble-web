import { Component, HostListener } from '@angular/core';
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
    // @ViewChild('info') private info!: ElementRef<HTMLCanvasElement>;

    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    buttonPressed = '';
    constructor(
        // private readonly gridService: GridService,
        private chatBoxHandler: ChatboxHandlerService,
        public gameClient: GameClientService,
        private tmpService: GridService,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

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

    // maybe not necessary
    containsSelected() {
        let value = false;
        this.gameClient.playerOne.rack.forEach((letter) => {
            if (letter.value === this.buttonPressed) {
                value = true;
            }
        });
        return value;
    }

    /* repositionRack(direction, selected){
        if (ArrowLeft && selected index == gameClient.playerOne.rack[0])
        if (ArrowRight && selected index == gameClient.playerOne.rack[6])

        else 
        case directionLeft: swap selected index with gameClient.playerOne.rack[i - 1]

        case directionRight:  swap selected index with gameClient.playerOne.rack[i + 1]
    }*/
}
