import { GameBoard } from '../classes/gameboard.class';
import { Coordinate } from './coordinate.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    isFirstWord: boolean;
    coords: Coordinate[];

    constructor(isHorizontal: boolean, isFirstWord: boolean, firstCoord: Coordinate, stringFormat: string, gameboard: GameBoard) {
        this.isHorizontal = isHorizontal;
        this.isFirstWord = isFirstWord;
        this.isValid = false;
        this.points = 0;

        const lettersInOrder = stringFormat.split('');
        let currentCoord = firstCoord;
        while (lettersInOrder.length && gameboard.getCoord(currentCoord).isOccupied) {
            const gameboardCoord = gameboard.getCoord(currentCoord);
            if (!gameboardCoord.isOccupied) {
                this.addNewLetterToWordCoords(lettersInOrder, currentCoord, gameboardCoord);
            } else {
                this.addOldLetterToWordCoords(currentCoord, gameboardCoord);
            }
            this.incrementCoord(currentCoord);
        }
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

    calculatePoints(word: Word, gameboard: GameBoard) {
        const letterCoords: Array<Coordinate> = word.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplyerPoints(letterCoords, gameboard);
        return this.points;
    }

    addLetterPoints(letterCoords: Array<Coordinate>, gameboard: GameBoard) {
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

    addWordMultiplyerPoints(letterCoords: Array<Coordinate>, gameboard: GameBoard) {
        letterCoords.forEach((letterCoord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                gameboardCoord.resetWordMultiplier;
            }
        });
    }
}
