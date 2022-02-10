/* eslint-disable no-restricted-imports */
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/Letter.class';
import { Gameboard } from './gameboard.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    newLetterCoords: LetterTile[];
    wordCoords: LetterTile[];
    stringFormat: string;
    adjacentWords: Word[];

    constructor(isHorizontal: boolean, firstCoord: Coordinate, stringFormat: string, gameboard: Gameboard) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;

        const lettersInOrder = stringFormat.split('');
        const currentCoord = firstCoord;

        // TODO:checker si le string.length = 1, then check both up and down for words

        while (lettersInOrder.length || gameboard.getLetter(currentCoord).isOccupied) {
            const gameboardCoord = gameboard.getLetter(currentCoord);
            if (!gameboardCoord.isOccupied) {
                this.addNewLetterToWordCoords(lettersInOrder, currentCoord, gameboardCoord);
                gameboard.placeLetter(this.newLetterCoords[this.newLetterCoords.length - 1]);
            } else {
                this.addOldLetterToWordCoords(currentCoord, gameboardCoord);
            }
            this.incrementCoord(currentCoord);
        }
        this.wordCoords.forEach((coord) => (stringFormat += coord.letter.string));
        this.findAjacentWords(gameboard, this.newLetterCoords);
    }

    /**
     * Adds letter from user command to word coordinates
     */
    addNewLetterToWordCoords(lettersInOrder: string[], currentCoord: Coordinate, gameboardCoord: LetterTile) {
        // const newLetter = {
        //     string: lettersInOrder[0],
        //     quantity: 0, // TODO: get data for quantity
        //     points: 0, // TODO: get points for letter
        // };
        gameboardCoord.value = '';
        const newLetterCoord = new LetterTile(currentCoord.x, currentCoord.y);
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

    findAjacentWords(gameboard: Gameboard, newletterCoords: Coordinate[]) {
        if (this.isHorizontal) {
            this.findNewAdjacentVerticalWords(gameboard, newletterCoords);
        } else {
            this.findNewAdjacentHorizontalWords(gameboard, newletterCoords);
        }
    }

    findNewAdjacentVerticalWords(gameboard: Gameboard, newletterCoords: Coordinate[]) {
        newletterCoords.forEach((coord) => {
            const upLetterCoord = new Coordinate(coord.x, coord.y + 1, {} as Letter);
            if (gameboard.getLetter(upLetterCoord).isOccupied) {
                while (gameboard.getLetter(upLetterCoord).isOccupied) {
                    upLetterCoord.y++;
                }
                this.buildAdjacentWord(gameboard, upLetterCoord);
            }
            const downLetterCoord = new Coordinate(coord.x, coord.y - 1, {} as Letter);
            if (gameboard.getLetter(downLetterCoord).isOccupied) {
                this.buildAdjacentWord(gameboard, coord);
            }
        });
    }

    findNewAdjacentHorizontalWords(gameboard: Gameboard, newletterCoords: Coordinate[]) {
        newletterCoords.forEach((coord) => {
            const leftLetterCoord = new Coordinate(coord.x - 1, coord.y, {} as Letter);
            if (gameboard.getLetter(leftLetterCoord).isOccupied) {
                while (gameboard.getLetter(leftLetterCoord).isOccupied) {
                    leftLetterCoord.x--;
                }
                this.buildAdjacentWord(gameboard, leftLetterCoord);
            }
            const rightLetterCoord = new Coordinate(coord.x + 1, coord.y, {} as Letter);
            if (gameboard.getLetter(rightLetterCoord).isOccupied) {
                this.buildAdjacentWord(gameboard, coord);
            }
        });
    }

    buildAdjacentWord(gameboard: Gameboard, firstLetterCoord: Coordinate) {
        this.adjacentWords.push(new Word(!this.isHorizontal, firstLetterCoord, gameboard.getLetter(firstLetterCoord).letter.string, gameboard));
    }

    calculatePoints(gameboard: Gameboard) {
        this.addLetterPoints(this.wordCoords, gameboard);
        this.addWordMultiplierPoints(this.wordCoords, gameboard);
        return this.points;
    }

    addLetterPoints(wordCoords: Coordinate[], gameboard: Gameboard) {
        wordCoords.forEach((coord: Coordinate) => {
            const gameboardCoord = gameboard.getLetter(coord);
            const INDEX_NOT_FOUND = -1;
            if (gameboardCoord.multiplier.number > 1 && this.newLetterCoords.indexOf(gameboardCoord) > INDEX_NOT_FOUND) {
                // flawed because letters arent the same as x and ys
                this.points += coord.letter.points * gameboardCoord.multiplier.number;
            } else {
                this.points += coord.letter.points;
            }
        });
    }

    addWordMultiplierPoints(wordCoords: Coordinate[], gameboard: Gameboard) {
        wordCoords.forEach((coord: Coordinate) => {
            const INDEX_NOT_FOUND = -1;
            const gameboardCoord = gameboard.getLetter(coord);
            if (
                gameboardCoord.multiplier.type === 'MOT' &&
                gameboardCoord.multiplier.number > 1 &&
                this.newLetterCoords.indexOf(gameboardCoord) > INDEX_NOT_FOUND
            ) {
                this.points *= gameboardCoord.multiplier.number;
            }
        });
    }
}
