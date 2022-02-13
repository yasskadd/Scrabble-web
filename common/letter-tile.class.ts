import * as letterTypes from '@common/letter-reserve';
import { Multiplier } from '@common/Multiplier';
import { Coordinate } from './coordinate';

export class LetterTile {
    coordinate: Coordinate;
    isOccupied: boolean;
    value: string;
    points: number;
    multiplier: Multiplier;

    constructor(position: Coordinate, letter: string) {
        this.coordinate = { ...position };
        this.isOccupied = false;
        this.value = letter;
        this.multiplier = { type: '', number: 1 };
    }

    setPoints(letterTile: LetterTile) {
        const letterType = letterTypes.LETTERS.filter((letter) => {
            return letter.stringChar === letterTile.value;
        })[0];
        letterTile.points = letterType.points;
    }
}
