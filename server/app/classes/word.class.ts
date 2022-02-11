/* eslint-disable no-restricted-imports */
import { Coordinate } from '@common/Coordinate';
import { Gameboard } from './gameboard.class';

export class Word {
    isHorizontal: boolean;
    isValid: boolean;
    points: number;
    newLetterCoords: Coordinate[];
    wordCoords: Coordinate[];

    constructor(isHorizontal: boolean, firstCoord: Coordinate, stringFormat: string, gameboard: Gameboard) {
        this.isHorizontal = isHorizontal;
        this.isValid = false;
        this.points = 0;

        // TODO: checker si le string.length = 1

        this.findWordCoords(firstCoord, stringFormat, gameboard);

        // if (coordList.length === 1) {
        //         const verticalWord: Word = this.buildVerticalWord(gameBoard, coordList[0]);
        //         const horizontalWord: Word = this.buildHorizontal(gameBoard, coordList[0]);
        //         if (verticalWord.coords.length !== 0 && verticalWord.coords.length !== 1) {
        //             newWordsArray.push(verticalWord);
        //         } else if (horizontalWord.coords.length !== 0 && horizontalWord.coords.length !== 1) {
        //             newWordsArray.push(horizontalWord);
        //         }
        //         return newWordsArray;}
    }

    private findWordCoords(firstCoord: Coordinate, stringFormat: string, gameboard: Gameboard) {
        const lettersInOrder = stringFormat.split('');
        const position = firstCoord;
        while (lettersInOrder.length || gameboard.getLetterTile(position).isOccupied) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                gameboard.placeLetter(position, lettersInOrder[0]);
                lettersInOrder.shift();
                this.wordCoords.push(position);
                this.newLetterCoords.push(position);
            } else {
                this.wordCoords.push(position);
            }
            this.isHorizontal ? position.x++ : position.y++;
        }
    }

    // SHOULD BE IN DIFFERENT FILE --> POINTS SERVICE ----------------------------------------
    calculateWordPoints(gameboard: Gameboard) {
        this.addLetterPoints(gameboard);
        this.addWordMultiplierPoints(gameboard);
        return this.points;
    }

    private addLetterPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            const INDEX_NOT_FOUND = -1; //TODO: take out!!
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                this.points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
            else this.points += gameboard.getLetterTile(coord).points;
        });
    }

    private addWordMultiplierPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            const INDEX_NOT_FOUND = -1; //TODO: take out!!
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'MOT' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                this.points *= gameboard.getLetterTile(coord).multiplier.number;
        });
    }
}
