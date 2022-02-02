/* eslint-disable no-restricted-imports */
import { GameBoard } from '../classes/gameboard.class';
import { Letter } from '../letter';
import { Coordinate } from './coordinate.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    newLetterCoords: Coordinate[];
    wordCoords: Coordinate[];
    stringFormat: string;
    adjacentWords: Word[];

    constructor(isHorizontal: boolean, firstCoord: Coordinate, stringFormat: string, gameboard: GameBoard) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;

        const lettersInOrder = stringFormat.split('');
        const currentCoord = firstCoord;

        // TODO:checker si le string.length = 1, then check both up and down for words

        while (lettersInOrder.length || gameboard.getCoord(currentCoord).isOccupied) {
            const gameboardCoord = gameboard.getCoord(currentCoord);
            if (!gameboardCoord.isOccupied) {
                this.addNewLetterToWordCoords(lettersInOrder, currentCoord, gameboardCoord);
            } else {
                this.addOldLetterToWordCoords(currentCoord, gameboardCoord);
            }
            this.incrementCoord(currentCoord);
        }
        this.wordCoords.forEach((coord) => (stringFormat += coord.letter.stringChar));
        this.findAjacentWords(gameboard, this.newLetterCoords);
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
        const newLetterCoord = new Coordinate(currentCoord.x, currentCoord.y, newLetter);
        this.wordCoords.push(newLetterCoord);
        this.newLetterCoords.push(newLetterCoord);
        lettersInOrder.shift();
    }

    /**
     * Adds letter from board to word coordinates
     */
    addOldLetterToWordCoords(currentCoord: Coordinate, gameboardCoord: Coordinate) {
        const oldLetterCoord = gameboardCoord.letter;
        this.wordCoords.push(new Coordinate(currentCoord.x, currentCoord.y, oldLetterCoord));
    }

    incrementCoord(currentCoord: Coordinate) {
        this.isHorizontal ? currentCoord.x++ : currentCoord.y++;
    }

    findAjacentWords(gameboard: GameBoard, newletterCoords: Coordinate[]) {
        if (this.isHorizontal) {
            this.findNewAdjacentVerticalWords(gameboard, newletterCoords);
        } else {
            this.findNewAdjacentHorizontalWords(gameboard, newletterCoords);
        }
    }

    findNewAdjacentVerticalWords(gameboard: GameBoard, newletterCoords: Coordinate[]) {
        newletterCoords.forEach((coord) => {
            let upLetterCoord = new Coordinate(coord.x, coord.y + 1, {} as Letter);
            if (gameboard.getCoord(upLetterCoord).isOccupied) {
                while (gameboard.getCoord(upLetterCoord).isOccupied) {
                    upLetterCoord.y++;
                }
                this.buildAdjacentWord(gameboard, upLetterCoord);
            }
            const downLetterCoord = new Coordinate(coord.x, coord.y - 1, {} as Letter);
            if (gameboard.getCoord(downLetterCoord).isOccupied) {
                this.buildAdjacentWord(gameboard, coord);
            }
        });
    }

    findNewAdjacentHorizontalWords(gameboard: GameBoard, newletterCoords: Coordinate[]) {
        newletterCoords.forEach((coord) => {
            let leftLetterCoord = new Coordinate(coord.x - 1, coord.y, {} as Letter);
            if (gameboard.getCoord(leftLetterCoord).isOccupied) {
                while (gameboard.getCoord(leftLetterCoord).isOccupied) {
                    leftLetterCoord.x--;
                }
                this.buildAdjacentWord(gameboard, leftLetterCoord);
            }
            const rightLetterCoord = new Coordinate(coord.x + 1, coord.y, {} as Letter);
            if (gameboard.getCoord(rightLetterCoord).isOccupied) {
                this.buildAdjacentWord(gameboard, coord);
            }
        });
    }

    buildAdjacentWord(gameboard: GameBoard, firstLetterCoord: Coordinate) {
        const firstCoordGameboardString: string = gameboard.getCoord(firstLetterCoord).letter.stringChar;
        const adjacentWord: Word = new Word(!this.isHorizontal, firstLetterCoord, firstCoordGameboardString, gameboard);
        this.adjacentWords.push(adjacentWord);
    }

    calculatePoints(gameboard: GameBoard) {
        this.addLetterPoints(this.wordCoords, gameboard);
        this.addWordMultiplierPoints(this.wordCoords, gameboard);
        return this.points;
    }

    addLetterPoints(wordCoords: Coordinate[], gameboard: GameBoard) {
        wordCoords.forEach((coord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(coord);
            if (gameboardCoord.letterMultiplier > 1 && this.newLetterCoords.includes(gameboardCoord)) {
                this.points += coord.letter.points * gameboardCoord.letterMultiplier;
            } else {
                this.points += coord.letter.points;
            }
        });
    }

    addWordMultiplierPoints(wordCoords: Coordinate[], gameboard: GameBoard) {
        wordCoords.forEach((coord: Coordinate) => {
            const gameboardCoord = gameboard.getCoord(coord);
            if (gameboardCoord.wordMultiplier > 1 && this.newLetterCoords.includes(gameboardCoord)) {
                this.points *= gameboardCoord.wordMultiplier;
            }
        });
    }
}
