import { GameBoard } from '../classes/gameboard.class';
import { Coordinate } from './coordinate.class';
import { Letter } from './letter.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;

    coordsInOrder: Coordinate[];
    lettersInOrder: Letter[];
    stringFormat: string;

    constructor(coordsInOrder: Coordinate[], lettersInOrder: Letter[], isHorizontal: boolean) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;

        // construct lettersInOrder
        coordsInOrder.forEach((coord: Coordinate) => {
            this.lettersInOrder.push(coord.getLetter());
        });

        // construct stringFormat
        lettersInOrder.forEach((letter: Letter) => (this.stringFormat += letter.stringChar));
    }

    calculatePoints(word: Word, gameboard: GameBoard) {
        const letterCoords: Array<Coordinate> = word.coordsInOrder;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplyerPoints(letterCoords, gameboard);
        return this.points;
    }

    addLetterPoints(letterCoords: Array<Coordinate>, gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getGameBoardCoord(letterCoord);
            if (gameboardCoord.getLetterMultiplier() > 1) {
                this.points += letterCoord.getLetter().points * gameboardCoord.getLetterMultiplier();
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.getLetter().points;
            }
        });
    }

    addWordMultiplyerPoints(letterCoords: Array<Coordinate>, gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getGameBoardCoord(letterCoord);
            if (gameboardCoord.getWordMultiplier() > 1) {
                this.points *= gameboardCoord.getWordMultiplier();
                gameboardCoord.resetWordMultiplier;
            }
        });
    }
}
