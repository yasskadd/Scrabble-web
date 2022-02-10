import * as constants from '@common/constants';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/Letter.class';
import { BoxMultiplier } from 'app/services/box-multiplier.service';
export class Gameboard {
    gameboard: LetterTile[] = new Array();

    constructor(private boxMultiplierService: BoxMultiplier) {
        this.createLetters();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    placeLetter(letter: LetterTile): boolean {
        const gameboardCoord = this.getLetter(letter.coordinate);
        if (gameboardCoord.isOccupied === true) {
            return false;
        } else {
            // TODO : remove letter to chevalet
            gameboardCoord.value = letter.value;
            gameboardCoord.isOccupied = true;
            return true;
        }
    }

    removeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getLetter(letterCoord);
        if (gameboardCoord.isOccupied) {
            // TODO : return letter to chevalet
            gameboardCoord.value = '';
            gameboardCoord.isOccupied = false;
        } else {
            return;
        }
    }

    getLetter(coordinate: Coordinate): LetterTile {
        return this.gameboard.filter((boardLetter) => {
            return boardLetter.coordinate.x === coordinate.x && boardLetter.coordinate.y === coordinate.y;
        })[0];
    }

    private createLetters(): void {
        for (let i = 1; i < constants.TOTAL_COLUMNS; i++) {
            for (let j = 1; j < constants.TOTAL_ROWS; j++) {
                const position: Coordinate = { x: i, y: j };
                const coord: LetterTile = new LetterTile(position, '');
                this.gameboard.push(coord);
            }
        }
    }
}
