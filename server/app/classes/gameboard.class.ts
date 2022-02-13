import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
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
            return letterTile.coordinate === coordinate;
        })[0];
    }

    private createLetterTiles(): void {
        for (let i = 1; i < 15; i++) {
            for (let j = 1; j < 15; j++) {
                const position: Coordinate = { x: i, y: j };
                const coord: LetterTile = new LetterTile(position, '');
                this.gameboard.push(coord);
            }
        }
    }
}
