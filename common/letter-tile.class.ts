import { Coordinate } from './coordinate';
import * as letterTypes from './letter-reserve';
import { Multiplier } from './multiplier';

export class LetterTile {
    coordinate: Coordinate;
    isOccupied: boolean;
    private letter: string;
    points: number;
    multiplier: Multiplier;

    constructor(position: Coordinate) {
        this.coordinate = { ...position };
        this.isOccupied = false;
        this.multiplier = { type: '', number: 1 };
        this.setLetter('');
    }

    public getLetter() {
        return this.letter;
    }

    public setLetter(letter: string) {
        this.letter = letter.toLowerCase();
        this.setPoints();
    }

    private setPoints() {
        if (this.letter === '') this.points = 0;
        else {
            const letterType = letterTypes.LETTERS.filter((letter) => {
                return letter.value === this.letter;
            })[0];
            this.points = letterType.points;
        }
    }
}
