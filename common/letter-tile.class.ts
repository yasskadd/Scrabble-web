import { Coordinate } from './coordinate';
import { Multiplier } from './multiplier';

export class LetterTile {
    coordinate: Coordinate;
    isOccupied: boolean;
    value: string;
    points: number;
    multiplier: Multiplier;

    constructor(position: Coordinate, letter: string) {
        this.coordinate.x = position.x;
        this.coordinate.y = position.y;
        this.isOccupied = false;
        this.value = letter;
        this.multiplier = { type: '', number: 1 };
    }
}
