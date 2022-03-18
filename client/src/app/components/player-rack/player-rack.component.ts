import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as constants from '@app/constants';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { Letter } from '@common/interfaces/letter';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent implements OnInit {
    @Input()
    keyboardParentSubject: Subject<KeyboardEvent>;

    @ViewChild('info', { static: false }) info: ElementRef;

    width: number;
    height: number;
    buttonPressed: string;
    currentSelection: number;
    previousSelection: number;
    lettersToExchange: number[];
    lettersToManipulate: number[];
    duplicates: number[];
    absentFromRack: boolean;
    temp: Letter = { value: 'a', quantity: 2, points: 1, isBlankLetter: false };

    constructor(
        private chatBoxHandler: ChatboxHandlerService,
        public gameClient: GameClientService,
        public letterPlacementService: LetterPlacementService,
        private gridService: GridService,
        private eRef: ElementRef,
    ) {
        this.width = constants.RACK_WIDTH;
        this.height = constants.RACK_HEIGHT;
        this.buttonPressed = '';
        this.currentSelection = 0;
        this.previousSelection = constants.INVALID_INDEX;
        this.lettersToExchange = [];
        this.lettersToManipulate = [];
        this.duplicates = [];
        this.absentFromRack = true;
    }

    @HostListener('mousewheel', ['$event'])
    onScrollEvent(event: WheelEvent) {
        this.cancel();
        this.buttonPressed = event.deltaY < 0 ? 'ArrowLeft' : 'ArrowRight';
        this.repositionRack();
    }

    @HostListener('window: click', ['$event'])
    clickOutside(event: { target: unknown; preventDefault: () => void }) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.cancel();
        }
    }

    ngOnInit() {
        this.keyboardParentSubject.subscribe((event) => {
            this.buttonPressed = event.key;
            this.cancel();
            this.selectManipulation();
        });
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
    get noPlacedLetters(): boolean {
        return this.letterPlacementService.noLettersPlaced();
    }

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }
    selectManipulation() {
        this.duplicates = [];

        if (this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight') {
            this.repositionRack();
            return;
        }

        for (const [i, letter] of this.rack.entries()) {
            if (letter.value === this.buttonPressed.toLowerCase() && !this.lettersToExchange.includes(i)) {
                this.duplicates.push(i);
            }
        }

        if (this.duplicates.length) {
            this.currentSelection = this.duplicates[(this.duplicates.indexOf(this.currentSelection) + 1) % this.duplicates.length];
            this.previousSelection = this.currentSelection;
            this.lettersToManipulate.push(this.currentSelection);
        } else {
            this.lettersToExchange = [];
        }
    }

    repositionRack() {
        this.previousSelection = constants.INVALID_INDEX;
        if (this.buttonPressed === 'ArrowLeft') {
            this.moveLeft();
        }

        if (this.buttonPressed === 'ArrowRight') {
            this.moveRight();
        }
    }

    playPlacedLetters() {
        this.letterPlacementService.submitPlacement();
    }

    onRightClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        const notFound = constants.INVALID_INDEX;
        this.lettersToManipulate = [];
        if (!this.lettersToExchange.includes(letter)) {
            this.lettersToExchange.push(letter);
        } else {
            const index = this.lettersToExchange.indexOf(letter);
            if (index > notFound) {
                this.lettersToExchange.splice(index, 1);
            }
        }
    }
    onLeftClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        if (!this.lettersToExchange.includes(letter)) {
            this.cancel();
            this.currentSelection = letter;
            this.lettersToManipulate.push(letter);
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
        this.lettersToManipulate = [];
    }

    moveLeft() {
        const rackIndices = 6;
        let temp;
        if (this.currentSelection === 0) {
            temp = this.gameClient.playerOne.rack[0];
            for (let i = 1; i < this.gameClient.playerOne.rack.length; i++) {
                this.gameClient.playerOne.rack[i - 1] = this.gameClient.playerOne.rack[i];
            }
            this.gameClient.playerOne.rack[rackIndices] = temp;
            this.currentSelection = rackIndices;
        } else {
            temp = this.gameClient.playerOne.rack[this.currentSelection - 1];
            this.gameClient.playerOne.rack[this.currentSelection - 1] = this.gameClient.playerOne.rack[this.currentSelection];
            this.gameClient.playerOne.rack[this.currentSelection] = temp;
            this.lettersToExchange[this.lettersToExchange.indexOf(this.currentSelection - 1)] = this.currentSelection;
            this.currentSelection -= 1;
        }
        this.lettersToManipulate.push(this.currentSelection);
    }

    moveRight() {
        const rackIndices = 6;
        let temp;
        if (this.currentSelection === rackIndices) {
            temp = this.gameClient.playerOne.rack[rackIndices];
            for (let i = this.gameClient.playerOne.rack.length - 1; i > 0; i--) {
                this.gameClient.playerOne.rack[i] = this.gameClient.playerOne.rack[i - 1];
            }
            this.gameClient.playerOne.rack[0] = temp;
            this.currentSelection = 0;
        } else {
            temp = this.gameClient.playerOne.rack[this.currentSelection + 1];
            this.gameClient.playerOne.rack[this.currentSelection + 1] = this.gameClient.playerOne.rack[this.currentSelection];
            this.gameClient.playerOne.rack[this.currentSelection] = temp;
            this.currentSelection += 1;
        }
        this.lettersToManipulate.push(this.currentSelection);
    }
}
