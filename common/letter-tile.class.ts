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

    setPoints() {
        this.points = 0; //TODO: GET DATA FROM LETTER TYPES???
    }
}
