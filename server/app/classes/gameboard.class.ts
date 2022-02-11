import * as constants from '@common/constants';
import { Coordinate } from '@common/Coordinate';
import { LetterTile } from '@common/LetterTile.class';
import { BoxMultiplier } from 'app/services/box-multiplier.service';
export class Gameboard {
    gameboard: LetterTile[] = new Array();

    constructor(private boxMultiplierService: BoxMultiplier) {
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    placeLetter(position: Coordinate, letter: string) {
        // TODO : remove letter to chevalet
        this.getLetterTile(position).value = letter;
        this.getLetterTile(position).setPoints();
        this.getLetterTile(position).isOccupied = true;
        return true;
    }

    removeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getLetterTile(letterCoord);
        if (gameboardCoord.isOccupied) {
            // TODO : return letter to chevalet
            gameboardCoord.value = '';
            gameboardCoord.isOccupied = false;
        } else {
            return;
        }
    }

    getLetterTile(coordinate: Coordinate): LetterTile {
        return this.gameboard.filter((boardLetter) => {
            return boardLetter.coordinate.x === coordinate.x && boardLetter.coordinate.y === coordinate.y;
        })[0];
    }

    private createLetterTiles(): void {
        for (let i = 1; i < constants.TOTAL_COLUMNS; i++) {
            for (let j = 1; j < constants.TOTAL_ROWS; j++) {
                const position: Coordinate = { x: i, y: j };
                const coord: LetterTile = new LetterTile(position, '');
                this.gameboard.push(coord);
            }
        }
    }
}
