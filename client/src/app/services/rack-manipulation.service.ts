import { Injectable } from '@angular/core';
import * as constants from '@app/constants';

@Injectable({
    providedIn: 'root',
})
export class RackManipulationService {
    width = constants.RACK_WIDTH;
    height = constants.RACK_HEIGHT;
    buttonPressed = '';
    currentSelection = 0;
    previousSelection = constants.INVALID_INDEX;
    previousScrollPosition = 0;
    lettersToExchange: number[] = [];
    lettersToManipulate: number[] = [];
    duplicates: number[] = [];
    arrow: boolean = false;
    absentFromRack: boolean = true;
    constructor() {}

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
}
