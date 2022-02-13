import * as constants from '@common/constants';
import { Coordinate } from '@common/Coordinate';
import { LetterTile } from '@common/LetterTile.class';
import { BoxMultiplierService } from 'app/services/box-multiplier.service';
export class Gameboard {
    gameboard: LetterTile[] = [];

    constructor(private boxMultiplierService: BoxMultiplierService) {
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
        // TODO : return letter to chevalet
        gameboardCoord.value = '';
        gameboardCoord.isOccupied = false;
    }

    getLetterTile(coordinate: Coordinate): LetterTile {
        return this.gameboard.filter((letterTile) => {
            return letterTile.coordinate.x === coordinate.x && letterTile.coordinate.y === coordinate.y;
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
