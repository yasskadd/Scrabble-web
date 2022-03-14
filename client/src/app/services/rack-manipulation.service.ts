import { Injectable } from '@angular/core';
import * as constants from '@app/constants';

@Injectable({
    providedIn: 'root',
})
export class RackManipulationService {
    width: number;
    height: number;
    buttonPressed: string;

    currentSelection = 0;
    previousSelection = constants.INVALID_INDEX;
    previousScrollPosition = 0;
    lettersToExchange: number[] = [];
    lettersToManipulate: number[] = [];
    duplicates: number[] = [];
    arrow: boolean = false;
    absentFromRack: boolean = true;

    constructor() {
        this.width = constants.RACK_WIDTH;
        this.height = constants.RACK_HEIGHT;
        this.buttonPressed = '';
    }

    cancel() {
        this.lettersToExchange = [];
        this.lettersToManipulate = [];
    }

    // repositionRack() {
    //     this.previousSelection = constants.INVALID_INDEX;
    //     if (this.buttonPressed === 'ArrowLeft') {
    //         this.moveLeft();
    //     } else {
    //         this.moveRight();
    //     }
    // }

    // selectManipulation(event: KeyboardEvent) {
    //     this.duplicates = [];
    //     this.arrow = this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight';

    //     if (this.arrow) {
    //         this.repositionRack();
    //         return;
    //     }

    //     for (const [i, letter] of this.rack.entries()) {
    //         if (letter.value === event.key.toLowerCase()) {
    //             this.duplicates.push(i);
    //         }
    //     }

    //     if (this.duplicates.length === 1) {
    //         this.previousSelection = constants.INVALID_INDEX;
    //         this.currentSelection = this.duplicates[0];
    //     } else if (this.duplicates.length > 1) {
    //         this.currentSelection = this.duplicates[(this.duplicates.indexOf(this.currentSelection) + 1) % this.duplicates.length];
    //         this.previousSelection = this.currentSelection;
    //     } else {
    //         this.cancel();
    //         return;
    //     }
    //     this.lettersToManipulate.push(this.currentSelection);
    // }

    selectExchange(event: MouseEvent, letter: number) {
        event.preventDefault();
        this.lettersToManipulate = [];
        const notFound = constants.INVALID_INDEX;
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
        this.cancel();
        this.currentSelection = letter;
        this.lettersToManipulate.push(letter);
    }
}
