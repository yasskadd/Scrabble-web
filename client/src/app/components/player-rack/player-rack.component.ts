import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
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
    // @Input()
    // parentSubject: Subject<KeyboardEvent>;

    @ViewChild('info', { static: false }) info: ElementRef;

    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    buttonPressed = '';
    previousPressed = '';
    currentSelection = 0;
    previousSelection = -1;
    lettersToExchange: number[] = [];
    lettersToManipulate: number[] = [];
    duplicates: number[] = [];
    arrow: boolean = false;

    temp: Letter = { value: 'a', quantity: 2, points: 1, isBlankLetter: false };

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

    @HostListener('document: keydown', ['$event']) // should focus on player rack. ex: letters still show if player is typing in chatbox
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        this.lettersToManipulate = [];
        this.selectManipulation(event);
    }

    // @HostListener('scroll')
    // onScroll(event: Event) {
    //     console.log('scrolling!');
    //     // console.log(this.getYPosition(event));
    // }

    // @HostListener('window:scroll', ['$event']) onScrollEvent() {
    //     // console.log($event['Window']);
    //     // console.log('scrolling');
    // }
    // ngOnInit() {
    //     this.parentSubject.subscribe((event) => {
    //         let index = -1;
    //         for (const [i, letter] of this.rack.entries()) {
    //             if (letter.value === event.key.toLowerCase()) index = i;
    //             if (!this.lettersToExchange.includes(index) && index !== -1) {
    //                 this.lettersToExchange.push(index);
    //                 break;
    //             }
    //         }
    //     });
    // }

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

    getYPosition(e: Event): number {
        return (e.target as Element).scrollTop;
    }

    selectManipulation(event: KeyboardEvent) {
        this.duplicates = [];
        this.arrow = this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight';

        if (this.arrow) {
            this.repositionRack();
            return;
        }

        for (const [i, letter] of this.rack.entries()) {
            if (letter.value === event.key.toLowerCase()) {
                this.duplicates.push(i);
            }
        }

        if (this.duplicates.length === 1) {
            this.currentSelection = this.duplicates[0];
        }

        if (this.duplicates.length > 1) {
            if (this.previousSelection === -1) {
                this.currentSelection = this.duplicates[0];
                this.previousSelection = this.currentSelection;
                this.previousPressed = event.key.toLowerCase();
            } else {
                if (this.previousSelection === this.duplicates.length - 1) {
                    this.currentSelection = this.duplicates[0]; // this condition not fully functional yet
                    this.previousSelection = this.currentSelection;
                    console.log('back to beginning');
                } else {
                    this.currentSelection = this.duplicates[this.duplicates.indexOf(this.currentSelection) + 1]; // go to the next right
                }
                console.log('here');
            }
        }
        this.lettersToManipulate.push(this.currentSelection);
    }

    repositionRack() {
        if (this.buttonPressed === 'ArrowLeft') {
            this.moveLeft();
        }

        if (this.buttonPressed === 'ArrowRight') {
            this.moveRight();
        }
    }

    onRightClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        this.lettersToManipulate = [];
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

    onLeftClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        this.lettersToManipulate = [];
        this.lettersToExchange = [];
        this.currentSelection = letter;
        this.lettersToManipulate.push(letter);
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

    moveLeft() {
        if (this.currentSelection === 0) {
            this.temp = this.gameClient.playerOne.rack[0];
            for (let i = 1; i < this.gameClient.playerOne.rack.length; i++) {
                this.gameClient.playerOne.rack[i - 1] = this.gameClient.playerOne.rack[i];
            }
            this.gameClient.playerOne.rack[6] = this.temp;
            this.currentSelection = 6;
        } else {
            this.temp = this.gameClient.playerOne.rack[this.currentSelection - 1];
            this.gameClient.playerOne.rack[this.currentSelection - 1] = this.gameClient.playerOne.rack[this.currentSelection];
            this.gameClient.playerOne.rack[this.currentSelection] = this.temp;

            this.currentSelection -= 1;
        }
        this.lettersToManipulate.push(this.currentSelection);
    }

    moveRight() {
        if (this.currentSelection === 6) {
            this.temp = this.gameClient.playerOne.rack[6];
            for (let i = this.gameClient.playerOne.rack.length - 1; i > 0; i--) {
                this.gameClient.playerOne.rack[i] = this.gameClient.playerOne.rack[i - 1];
            }
            this.gameClient.playerOne.rack[0] = this.temp;
            this.currentSelection = 0;
        } else {
            this.temp = this.gameClient.playerOne.rack[this.currentSelection + 1];
            this.gameClient.playerOne.rack[this.currentSelection + 1] = this.gameClient.playerOne.rack[this.currentSelection];
            this.gameClient.playerOne.rack[this.currentSelection] = this.temp;
            this.currentSelection += 1;
        }
        this.lettersToManipulate.push(this.currentSelection);
    }
}
