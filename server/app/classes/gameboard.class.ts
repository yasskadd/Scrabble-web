import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
export class Gameboard {
    gameboardTiles: LetterTile[] = [];

    constructor(private boxMultiplierService: BoxMultiplierService) {
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    placeLetter(position: Coordinate, letter: string) {
        // TODO : remove letter to chevalet
        this.getLetterTile(position).setLetter(letter);
        this.getLetterTile(position).isOccupied = true;
        return true;
    }

    removeLetter(letterCoord: Coordinate) {
        const gameboardCoord = this.getLetterTile(letterCoord);
        gameboardCoord.setLetter('');
        gameboardCoord.isOccupied = false;
    }

    getLetterTile(coordinate: Coordinate): LetterTile {
        return this.gameboardTiles.filter((letterTile) => {
            return letterTile.coordinate === coordinate;
        })[0];
    }

    private createLetterTiles(): void {
        for (let i = 1; i < 15; i++) {
            for (let j = 1; j < 15; j++) {
                const position: Coordinate = { x: i, y: j };
                const coord: LetterTile = new LetterTile(position);
                this.gameboardTiles.push(coord);
            }
        }
    }
}
