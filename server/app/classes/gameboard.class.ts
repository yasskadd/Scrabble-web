/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
import { Inject } from 'typedi';

const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;

export class Gameboard {
    gameboardTiles: LetterTile[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplierService) {
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createLetterTiles() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                const letterTile: LetterTile = new LetterTile({ x: i, y: j });
                this.gameboardTiles.push(letterTile);
            }
        }
    }

    getLetterTile(coord: Coordinate) {
        return this.gameboardTiles.filter((gameboardTile) => {
            return gameboardTile.coordinate === coord;
        })[0];
    }

    placeLetter(position: Coordinate, letter: string) {
        this.getLetterTile(position).setLetter(letter);
        this.getLetterTile(position).isOccupied = true;
    }

    removeLetter(position: Coordinate) {
        this.getLetterTile(position).setLetter('');
        this.getLetterTile(position).isOccupied = false;
    }
}
