import { Coordinate } from './coordinate';
import * as letterTypes from './letter-reserve';
import { Multiplier } from './multiplier';

export class LetterTile {
    coordinate: Coordinate;
    isOccupied: boolean;
    private _letter: string;
    points: number;
    multiplier: Multiplier;

    constructor(position: Coordinate) {
        this.coordinate = { ...position };
        this.isOccupied = false;
        this.multiplier = { type: '', number: 1 };
        this.letter = '';
    }

    get letter(): string {
        console.log('Hellowlrd');
        return this._letter;
    }

    set letter(newLetter: string) {
        this._letter = newLetter;
        this.setPoints();
    }

    private setPoints() {
        if (this._letter === '') {
            this.points = 0;
        } else {
            const letterType = letterTypes.LETTERS.filter((letter) => {
                return letter.value === this._letter;
            })[0];
            this.points = letterType.points;
        }
    }
}
