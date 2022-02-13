/* eslint-disable no-restricted-imports */
import { CommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { Gameboard } from './gameboard.class';

export class Word {
    isValid: boolean;
    isHorizontal: boolean;
    points: number;
    newLetterCoords: Coordinate[] = [];
    wordCoords: Coordinate[] = [];
    stringFormat: string;

    constructor(commandInfo: CommandInfo, gameboard: Gameboard) {
        this.isValid = false;
        this.points = 0;
        this.isHorizontal = commandInfo.isHorizontal;

        if (commandInfo.isHorizontal === undefined && commandInfo.lettersPlaced.length === 1) {
            this.setIsHorizontal(commandInfo.firstCoordinate, gameboard);
        }

        const firstCoord = this.findFirstCoord(commandInfo.firstCoordinate, gameboard);
        this.findWordCoords(firstCoord, commandInfo.lettersPlaced, gameboard);
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

    private findWordCoords(firstCoord: Coordinate, placedLetters: string[], gameboard: Gameboard) {
        const position = firstCoord;

        while (placedLetters.length || gameboard.getLetterTile(position).isOccupied) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                gameboard.placeLetter(position, placedLetters[0]); // TODO : move
                this.stringFormat += placedLetters[0];
                placedLetters.shift();
                this.wordCoords.push(position);
                this.newLetterCoords.push(position);
            } else {
                this.wordCoords.push(position);
                this.stringFormat += gameboard.getLetterTile(position).getLetter();
            }
            // TODO: fix this
            this.isHorizontal ? position.x++ : position.y++;
        }
    }
}
