/* eslint-disable prettier/prettier */
import * as multipliers from '@common/board-multiplier-coords';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';

const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;
const MIDDLE_COORD = { x: 8, y: 8 };

export class Gameboard {
    gameboardTiles: LetterTile[] = new Array();

    constructor() {
        this.createLetterTiles();
        this.applyBoxMultipliers(this);
    }

    createLetterTiles() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                this.gameboardTiles.push(new LetterTile({ x: i, y: j }));
            }
        }
    }

    applyBoxMultipliers(gameboard: Gameboard) {
        multipliers.letterMultipliersByTwo.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'LETTRE', number: 2 };
        });

        multipliers.letterMultipliersByThree.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'LETTRE', number: 3 };
        });

        multipliers.wordMultipliersByTwo.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'MOT', number: 2 };
        });

        multipliers.wordMultipliersByThree.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'MOT', number: 3 };
        });

        gameboard.getLetterTile(MIDDLE_COORD).multiplier = { type: 'MOT', number: 2 };
    }

    getLetterTile(position: Coordinate): LetterTile {
        this.checkIfWithinBounds(position);
        return this.gameboardTiles.filter((gameboardTile) => {
            return gameboardTile.coordinate === position;
        })[0];
    }

    placeLetter(position: Coordinate, letter: string) {
        this.checkIfWithinBounds(position);
        this.getLetterTile(position).setLetter(letter);
        this.getLetterTile(position).isOccupied = true;
    }

    removeLetter(position: Coordinate) {
        this.checkIfWithinBounds(position);
        this.getLetterTile(position).setLetter('');
        this.getLetterTile(position).isOccupied = false;
    }

    checkIfWithinBounds(position: Coordinate): boolean {
        return position.x > ROW_NUMBERS || position.x < 1 || position.y > ROW_NUMBERS || position.y < 1;
    }
}
