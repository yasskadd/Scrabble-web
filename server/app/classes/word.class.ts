import { Gameboard } from '@app/classes/gameboard.class';
import * as letterTypes from '@app/letter-reserve';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Letter } from '@common/interfaces/letter';

// TODO: TEMPORARY WAITING FOR REFACTOR
const setPoints = (tile: LetterTile) => {
    const letterType = letterTypes.LETTERS.filter((letter) => {
        return letter.value === tile.letter.value.toLocaleLowerCase();
    })[0];
    tile.letter = { value: tile.letter.value, points: letterType.points } as Letter;
};

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
        letterCoords.forEach((tile) => {
            setPoints(tile);
        });
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
