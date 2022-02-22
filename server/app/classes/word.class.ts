/* eslint-disable no-restricted-imports */
import { CommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/letter-tile.class';
import { Gameboard } from './gameboard.class';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;
export class Word {
    isValid: boolean;
    isHorizontal: boolean |undefined;
    points: number;
    stringFormat: string;               // used for dictionary validation
    newLetterCoords: Coordinate[] = []; //
    wordCoords: Coordinate[] = [];
    allWords: Word[] = [];

    constructor(commandInfo: CommandInfo, gameboard: Gameboard) {
        this.isValid = true;
        this.points = 0;
        this.isHorizontal = commandInfo.isHorizontal;

        if (commandInfo.isHorizontal === undefined && commandInfo.letters.length === 1) {
            this.setIsHorizontal(commandInfo.firstCoordinate, gameboard);
        }

        const firstCoord = this.findFirstCoord(commandInfo.firstCoordinate, gameboard);
        this.findWordCoords(firstCoord, commandInfo.letters, gameboard);
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
        else this.isValid = false;
    }

    private findFirstCoord(coord: Coordinate, gameboard: Gameboard): Coordinate {
        if (!this.isHorizontal) {
            if (this.isWithinBoardLimits({ x: coord.x, y: coord.y - 1 }) && gameboard.getLetterTile({ x: coord.x, y: coord.y - 1 }).isOccupied) {
                while (this.isWithinBoardLimits({ x: coord.x, y: coord.y - 1 }) && gameboard.getLetterTile({ x: coord.x, y: coord.y - 1 }).isOccupied)
                    coord.y--;
                return coord;
            }
        } else {
            if (this.isWithinBoardLimits({ x: coord.x - 1, y: coord.y }) && gameboard.getLetterTile({ x: coord.x - 1, y: coord.y }).isOccupied) {
                while (this.isWithinBoardLimits({ x: coord.x - 1, y: coord.y }) && gameboard.getLetterTile({ x: coord.x - 1, y: coord.y }).isOccupied)
                    coord.x--;
                return coord;
            }
        }
        return coord;
    }

    static findNewWords(gameboard: Gameboard, placedLettersCoords: LetterTile[]): Word[] {
        const newWordsArray: Word[] = new Array();
        if (placedLettersCoords.length === 0) return [];
        if (placedLettersCoords.length === 1) {
            const verticalWord: Word = this.buildWord(false, placedLettersCoords[0], gameboard);
            const horizontalWord: Word = this.buildWord(true, placedLettersCoords[0], gameboard);
            if (verticalWord.coords.length > 1) newWordsArray.push(verticalWord);
            if (horizontalWord.coords.length > 1) newWordsArray.push(horizontalWord);
        } else {
            const firstWord: Word = this.buildFirstWord(placedLettersCoords, gameboard);
            newWordsArray.push(firstWord);
            placedLettersCoords.forEach((coord) => {
                const word: Word = this.buildWord(!firstWord.isHorizontal, coord, gameboard);
                if (word.coords?.length > 1) newWordsArray.push(word);
            });
        }
        return newWordsArray;
    }

    calculatePoints(gameboard: Gameboard): number {
        const letterCoords: LetterTile[] = this.coords;
        this.addLetterPoints(letterCoords, gameboard);
        this.addWordMultiplierPoints(letterCoords, gameboard);
        return this.points;
    }

    private addLetterPoints(letterCoords: LetterTile[], gameboard: Gameboard): void {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.letterMultiplier > 1) {
                this.points += letterCoord.letter.points * gameboardCoord.letterMultiplier;
                gameboardCoord.resetLetterMultiplier();
            } else {
                this.points += letterCoord.letter.points;
            }
            return coord;
        }
    }

    private addWordMultiplierPoints(letterCoords: LetterTile[], gameboard: Gameboard): void {
        letterCoords.forEach((letterCoord: LetterTile) => {
            const gameboardCoord = gameboard.getCoord(letterCoord);
            if (gameboardCoord.wordMultiplier > 1) {
                this.points *= gameboardCoord.wordMultiplier;
                gameboardCoord.resetWordMultiplier();
            }
            // TODO: fix this
            this.isHorizontal ? position.x++ : position.y++;
        }
    }}

    private buildWord(firstCoord: Coordinate, commandLetters: string[], gameboard: Gameboard) {
        const position = firstCoord;
        let commandLettersCopy = { ...commandLetters };

        while ((commandLettersCopy.length || gameboard.getLetterTile(position).isOccupied) && this.isWithinBoardLimits(position)) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                this.stringFormat += commandLettersCopy[0];
                gameboard.placeLetter(position, commandLettersCopy[0]);
                commandLettersCopy.shift();
                this.wordCoords.push(position);
                this.newLetterCoords.push(position);
            } else {
                this.wordCoords.push(position);
                this.stringFormat += gameboard.getLetterTile(position).getLetter();
    

        if (commandLettersCopy.length !== 0) this.isValid == false;
    }

    findAdjacentWords(word: Word, gameboard: Gameboard): Word[] {
        this.allWords.push(word);
             this.allWords.push(
                new Word(
                    {
                        firstCoordinate: coord,
                        isHorizontal: !word.isHorizontal,
                        letters: [gameboard.getLetterTile(coord).getLetter()],
                    },
                    gameboard,
                ),
            );
    }
}
