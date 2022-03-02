import { Component, HostListener, Renderer2 } from '@angular/core';
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
    // constructor(
    //     // private readonly gridService: GridService,
    //     private chatBoxHandler: ChatboxHandlerService,
    //     public gameClient: GameClientService,
    //     private tmpService: GridService,
    // ) {}

    lettersToExchange: number[] = [];
    constructor(
        private chatBoxHandler: ChatboxHandlerService,
        public gameClient: GameClientService,
        private tmpService: GridService,
        private renderer: Renderer2,
    ) {
        this.renderer.listen('window', 'click', () => {
            this.lettersToExchange = [];
        });
    }

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
    onRightClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        const notFound = -1;
        if (!this.lettersToExchange.includes(letter)) {
            this.lettersToExchange.push(letter);
        } else {
            const index = this.lettersToExchange.indexOf(letter);
            if (index > notFound) {
                this.lettersToExchange.splice(index, 1);
            }
        }
    }

    exchange() {
        let letters = '';
        for (const i of this.lettersToExchange) {
            for (const letter of this.rack) {
                if (i === this.rack.indexOf(letter)) {
                    letters += letter.value;
                }
            }
        }
        this.cancel();
        this.chatBoxHandler.submitMessage('!échanger ' + letters);
    }

    cancel() {
        this.lettersToExchange = [];
    }
}
