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
    toManipulate = 0;
    lettersToExchange: number[] = [];
    lettersToManipulate: number[] = [];
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
        console.log('hellooooooo');
        this.lettersToManipulate = [];
        this.selectManipulation(event);
    }

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

    selectManipulation(event: KeyboardEvent) {
        // const index = -1;
        const idx = [];
        this.arrow = this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight';

        for (const [i, letter] of this.rack.entries()) {
            if (letter.value === event.key.toLowerCase()) {
                // index = i;
                idx.push(i);
            }
        }

        // rack with duplicate letters
        if (idx.length > 1) {
            for (const idc of idx) {
                if (idc === this.toManipulate) {
                    if (idx.indexOf(idc) === idx.length - 1) {
                        this.toManipulate = 0; // go back to beginning
                    } else {
                        this.toManipulate = idc + 1; // go to the next right
                    }
                }
            }
        } else if (this.arrow) {
            this.repositionRack();
        } else {
            this.toManipulate = idx[0];
        }

        this.lettersToManipulate.push(this.toManipulate);
    }

    repositionRack() {
        //
        // if (this.toManipulate === this.gameClient.playerOne.rack[6]);

        if (this.buttonPressed === 'ArrowLeft') {
            this.moveLeft();
        }

        if (this.buttonPressed === 'ArrowRight') {
            this.moveRight();
        }
    }

    moveLeft() {
        if (this.toManipulate === 0) {
            this.temp = this.gameClient.playerOne.rack[0];
            for (let i = 1; i < this.gameClient.playerOne.rack.length; i++) {
                this.gameClient.playerOne.rack[i - 1] = this.gameClient.playerOne.rack[i];
            }
            this.gameClient.playerOne.rack[6] = this.temp;
            this.toManipulate = 6;
        } else {
            this.temp = this.gameClient.playerOne.rack[this.toManipulate - 1];
            this.gameClient.playerOne.rack[this.toManipulate - 1] = this.gameClient.playerOne.rack[this.toManipulate];
            this.gameClient.playerOne.rack[this.toManipulate] = this.temp;

            this.toManipulate -= 1;
        }
        this.lettersToManipulate.push(this.toManipulate);
        console.log('moving left!');
    }

    moveRight() {
        if (this.toManipulate === 6) {
            this.temp = this.gameClient.playerOne.rack[6];
            for (let i = this.gameClient.playerOne.rack.length - 1; i > 0; i--) {
                this.gameClient.playerOne.rack[i] = this.gameClient.playerOne.rack[i - 1];
            }
            this.gameClient.playerOne.rack[0] = this.temp;
            this.toManipulate = 0;
        } else {
            this.temp = this.gameClient.playerOne.rack[this.toManipulate + 1];
            this.gameClient.playerOne.rack[this.toManipulate + 1] = this.gameClient.playerOne.rack[this.toManipulate];
            this.gameClient.playerOne.rack[this.toManipulate] = this.temp;
            this.toManipulate += 1;
        }
        this.lettersToManipulate.push(this.toManipulate);
        console.log('moving right!');
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

    onLeftClick(event: MouseEvent, letter: number) {
        event.preventDefault();
        this.lettersToManipulate = [];
        this.lettersToExchange = [];
        this.toManipulate = letter;
        console.log(letter);
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
}
