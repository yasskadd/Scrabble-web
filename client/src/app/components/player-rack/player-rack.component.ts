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
    @ViewChild('info', { static: false }) info: ElementRef;
    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    buttonPressed = '';
    lastKeyPressed = 0;
    lettersToExchange: number[] = [];
    lettersToManipulate: number[] = [];
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
        this.selectManipulation(event);
        // this.repositionRack();
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

    selectManipulation(event: KeyboardEvent) {
        let index = -1;
        for (const [i, letter] of this.rack.entries()) {
            if (letter.value === event.key.toLowerCase()) {
                index = i;
            }
            this.repositionRack();
            if (!this.lettersToManipulate.includes(index) && index !== -1) {
                this.lettersToManipulate.push(index);
                this.lastKeyPressed = index;
            }
            // else {
            //     this.lettersToManipulate = [];
            // }
            // return; // modify function to select the duplicate letters starting from left side
        }
        console.log(index);
    }

    repositionRack() {
        // if (this.buttonPressed === "ArrowLeft" && selected index == this.gameClient.playerOne.rack[0])
        // if (this.buttonPressed === "ArrowRight"  && selected index == this.gameClient.playerOne.rack[6]);

        if (this.buttonPressed === 'ArrowLeft') {
            this.temp = this.gameClient.playerOne.rack[this.lastKeyPressed - 1];
            this.gameClient.playerOne.rack[this.lastKeyPressed - 1] = this.gameClient.playerOne.rack[this.lastKeyPressed];
            this.gameClient.playerOne.rack[this.lastKeyPressed] = this.temp;
        }

        if (this.buttonPressed === 'ArrowRight') {
            this.temp = this.gameClient.playerOne.rack[this.lastKeyPressed + 1];
            this.gameClient.playerOne.rack[this.lastKeyPressed + 1] = this.gameClient.playerOne.rack[this.lastKeyPressed];
            this.gameClient.playerOne.rack[this.lastKeyPressed] = this.temp;
        }

        // if (this.buttonPressed === 'ArrowRight') {
        //     this.lettersToManipulate.push(this.lastKeyPressed + 1);
        //     this.lettersToManipulate.splice(this.lastKeyPressed, 1);
        // }
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
        const notFound = -1;
        if (!this.lettersToManipulate.includes(letter)) {
            this.lettersToManipulate.push(letter);
        } else {
            const index = this.lettersToManipulate.indexOf(letter);
            if (index > notFound) {
                this.lettersToManipulate.splice(index, 1);
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
