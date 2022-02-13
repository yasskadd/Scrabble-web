/* eslint-disable no-restricted-imports */
import { Coordinate } from '@common/coordinate';
import { Gameboard } from './gameboard.class';

export class Word {
    isValid: boolean;
    points: number;
    newLetterCoords: Coordinate[] = [];
    wordCoords: Coordinate[] = [];
    stringFormat: string;

    constructor(public isHorizontal: boolean | undefined, coord: Coordinate, stringFormat: string, gameboard: Gameboard) {
        this.isValid = false;
        this.points = 0;

        if (isHorizontal === undefined && stringFormat.length === 1) {
            this.setIsHorizontal(coord, gameboard);
        }

        const firstCoord = this.findFirstCoord(coord, gameboard);
        this.findWordCoords(firstCoord, stringFormat, gameboard);
    }
    isWithinBoardLimits(coord: Coordinate): boolean {
        return coord.x >= 1 && coord.x <= 15 && coord.y >= 1 && coord.y <= 15;
    }

    private setIsHorizontal(firstCoord: Coordinate, gameboard: Gameboard) {
        if (
            gameboard.getLetterTile({ x: firstCoord.x, y: firstCoord.y-- }).isOccupied ||
            gameboard.getLetterTile({ x: firstCoord.x, y: firstCoord.y++ }).isOccupied
        )
            this.isHorizontal = false;
        else if (
            gameboard.getLetterTile({ x: firstCoord.x--, y: firstCoord.y }).isOccupied ||
            gameboard.getLetterTile({ x: firstCoord.x++, y: firstCoord.y }).isOccupied
        )
            this.isHorizontal = true;
        else this.isValid = false; // TODO : message d'erreur!!
    }

    private findFirstCoord(coord: Coordinate, gameboard: Gameboard): Coordinate {
        if (!this.isHorizontal) {
            if (this.isWithinBoardLimits({ x: coord.x, y: coord.y - 1 }) && gameboard.getLetterTile({ x: coord.x, y: coord.y - 1 }).isOccupied) {
                while (this.isWithinBoardLimits({ x: coord.x, y: coord.y - 1 }) && gameboard.getLetterTile({ x: coord.x, y: coord.y - 1 }).isOccupied)
                    coord.y--;
                return coord;
            }
            return coord;
        } else {
            if (this.isWithinBoardLimits({ x: coord.x - 1, y: coord.y }) && gameboard.getLetterTile({ x: coord.x - 1, y: coord.y }).isOccupied) {
                while (this.isWithinBoardLimits({ x: coord.x - 1, y: coord.y }) && gameboard.getLetterTile({ x: coord.x - 1, y: coord.y }).isOccupied)
                    coord.x--;
                return coord;
            }
            return coord;
        }
    }

    private findWordCoords(firstCoord: Coordinate, stringFormat: string, gameboard: Gameboard) {
        const lettersInOrder = stringFormat.split('');
        const position = firstCoord;

        while (lettersInOrder.length || gameboard.getLetterTile(position).isOccupied) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                gameboard.placeLetter(position, lettersInOrder[0]);
                this.stringFormat += lettersInOrder[0];
                lettersInOrder.shift();
                this.wordCoords.push(position);
                this.newLetterCoords.push(position);
            } else {
                this.wordCoords.push(position);
                this.stringFormat += gameboard.getLetterTile(position).value;
            }
            // TODO: fix this
            this.isHorizontal ? position.x++ : position.y++;
        }
    }
}
