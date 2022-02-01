import { GameBoard } from '../classes/gameboard.class';
import { Coordinate } from './coordinate.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    isFirstWord: boolean;
    coords: Coordinate[];
    stringFormat: string;

    constructor(isHorizontal: boolean, isFirstWord: boolean, firstCoord: Coordinate, stringFormat: string, gameboard: GameBoard) {
        this.isHorizontal = isHorizontal;
        this.isFirstWord = isFirstWord;
        this.isValid = false;
        this.points = 0;

        const lettersInOrder = stringFormat.split('');
        const currentCoord = firstCoord;
        while (lettersInOrder.length && gameboard.getCoord(currentCoord).isOccupied) {
            const gameboardCoord = gameboard.getCoord(currentCoord);
            if (!gameboardCoord.isOccupied) {
                this.addNewLetterToWordCoords(lettersInOrder, currentCoord, gameboardCoord);
            } else {
                this.addOldLetterToWordCoords(currentCoord, gameboardCoord);
            }
            this.incrementCoord(currentCoord);
        }

        this.coords.forEach((coord) => (stringFormat += coord.letter.stringChar));
    }

    /**
     * Adds letter from user command to word coordinates
     */
    addNewLetterToWordCoords(lettersInOrder: string[], currentCoord: Coordinate, gameboardCoord: Coordinate) {
        const newLetter = {
            stringChar: lettersInOrder[0],
            quantity: 0, // TODO: get data for quantity
            points: 0, // TODO: get points for letter
        };
        gameboardCoord.letter = newLetter;
        this.coords.push(new Coordinate(currentCoord.x, currentCoord.y, newLetter));
        lettersInOrder.shift();
    }

    /**
     * Adds letter from board to word coordinates
     */
    addOldLetterToWordCoords(currentCoord: Coordinate, gameboardCoord: Coordinate) {
        const oldLetter = gameboardCoord.letter;
        this.coords.push(new Coordinate(currentCoord.x, currentCoord.y, oldLetter));
    }

    incrementCoord(currentCoord: Coordinate) {
        this.isHorizontal ? currentCoord.x++ : currentCoord.y++;
    }

    // TODO: find adjacent words à partir de this.coords and return array of string words

    calculatePoints(word: Word, gameboard: GameBoard) {
        const letterCoords: Coordinate[] = word.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.i(letterCoords, gameboard);
        return this.points;
    }

    addLetterPoints(letterCoords: Coordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
        });
    }

    addWordMultiplierPoints(letterCoords: Coordinate[], gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                gameboardCoord.resetWordMultiplier;
            }
        });
    }
}
