import { Component, ElementRef, HostListener } from '@angular/core';
import * as constants from '@app/constants';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { Letter } from '@common/letter';

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent {
    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    lettersToExchange: number[] = [];
    clicked: number[] = [];
    constructor(
        // I think there's too many services in this component (╯‵□′)╯︵┻━┻
        private chatBoxHandler: ChatboxHandlerService,
        public gameClient: GameClientService,
        public letterPlacementService: LetterPlacementService,
        private gridService: GridService,
        private eRef: ElementRef,
    ) {}

    @HostListener('document:click', ['$event'])
    clickOutside(event: { target: unknown; preventDefault: () => void }) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.lettersToExchange = [];
        }
    }

    get letterSize(): number {
        return this.gridService.letterSize;
    }
    get pointsSize(): number {
        return this.gridService.letterSize * constants.LETTER_WEIGHT_RATIO;
    }
    get rack(): Letter[] {
        return this.gameClient.playerOne.rack;
    }

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }

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

    // Added function -------------------------------------
    // TODO : TEST
    playPlacedLetters() {
        this.letterPlacementService.submitPlacement();
    }
    get noPlacedLetters(): boolean {
        return this.letterPlacementService.noLettersPlaced();
    }
    // -----------------------------------------------------

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
