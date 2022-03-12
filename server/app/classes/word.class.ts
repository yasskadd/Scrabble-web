import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTile } from '@common/classes/letter-tile.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    coords: LetterTile[];
    stringFormat: string;

    constructor(isHorizontal: boolean, coordList: LetterTile[]) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;
        this.coords = coordList;
        this.stringFormat = '';
        coordList.forEach((coord: LetterTile) => {
            this.stringFormat += coord.letter.value?.toLowerCase();
        });
    }

    calculatePoints(gameboard: Gameboard) {
        const letterCoords: LetterTile[] = this.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplierPoints(letterCoords, gameboard);
        return this.points;
    }

    private addLetterPoints(letterCoords: LetterTile[], gameboard: Gameboard) {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
        });
    }

    private addWordMultiplierPoints(letterCoords: LetterTile[], gameboard: Gameboard) {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                gameboardCoord.resetWordMultiplier();
            }
        });
    }
}
