/* eslint-disable no-restricted-imports */
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { Gameboard } from './gameboard.class';

const INDEX_NOT_FOUND = -1;

export class Word {
    isValid: boolean;
    isHorizontal: boolean | undefined;
    points: number;
    stringFormat: string;
    newLetterCoords: Coordinate[] = [];
    wordCoords: Coordinate[] = [];

    constructor(commandInfo: CommandInfo, gameboard: Gameboard) {
        this.isValid = true;
        this.points = 0;
        this.isHorizontal = commandInfo.isHorizontal;

        if (commandInfo.isHorizontal === undefined && commandInfo.letters.length === 1) {
            this.setIsHorizontal(commandInfo.firstCoordinate, gameboard);
        }

        const firstCoord = this.findFirstCoord(commandInfo.firstCoordinate, gameboard);
        this.buildWord(firstCoord, commandInfo.letters, gameboard);
    }

    // CONSTRUCTOR FUNCTIONS -------------------------------------------------------------------------------------------------
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
        const backwardPosition = this.isHorizontal ? { x: coord.x - 1, y: coord.y } : { x: coord.x, y: coord.y - 1 };
        if (this.isWithinBoardLimits(backwardPosition) && gameboard.getLetterTile(backwardPosition).isOccupied) {
            while (this.isWithinBoardLimits(backwardPosition) && gameboard.getLetterTile(backwardPosition).isOccupied)
                if (this.isHorizontal) coord.x--;
                else coord.y--;
            return coord;
        } else return coord;
    }

    private buildWord(firstCoord: Coordinate, commandLetters: string[], gameboard: Gameboard) {
        const position = firstCoord;
        let commandLettersCopy = commandLetters.slice();
        if (commandLettersCopy === ['']) commandLettersCopy.shift();

        console.log(commandLettersCopy.length);
        console.log(gameboard.getLetterTile(position).isOccupied);
        while ((commandLettersCopy.length || gameboard.getLetterTile(position).isOccupied) && this.isWithinBoardLimits(position)) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                this.stringFormat += commandLettersCopy[0];
                commandLettersCopy.shift();
                this.wordCoords.push(position);
                this.newLetterCoords.push(position);
            } else {
                this.wordCoords.push(position);
                this.stringFormat += gameboard.getLetterTile(position).getLetter();
            }
            if (this.isHorizontal) position.x++;
            else position.y++;
        }
        if (commandLettersCopy.length !== 0) this.isValid = false;
        if (this.wordCoords.length < 2) this.isValid = false;
    }

    isWithinBoardLimits(coord: Coordinate): boolean {
        return coord.x >= 1 && coord.x <= 15 && coord.y >= 1 && coord.y <= 15;
    }

    // FIND ADJACENT WORDS ---------------------------------------------------------------------------------------------------
    static findAdjacentWords(word: Word, gameboard: Gameboard): Word[] {
        const allWords: Word[] = [];
        allWords.push(word);
        word.newLetterCoords.forEach((coord: Coordinate) => {
            const newWord = new Word(
                {
                    firstCoordinate: coord,
                    isHorizontal: !word.isHorizontal,
                    letters: [''],
                },
                gameboard,
            );
            if (newWord.wordCoords.length !== 1) allWords.push(newWord);
        });
        return allWords;
    }

    // CALCULATE POINTS ----------------------------------------------------------------------------------------------------
    static calculateWordPoints(word: Word, gameboard: Gameboard): number {
        let points: number = 0;
        this.addLetterPoints(word, points, gameboard);
        this.addWordMultiplierPoints(word, points, gameboard);
        return points;
    }

    static addLetterPoints(word: Word, points: number, gameboard: Gameboard) {
        word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
            else points += gameboard.getLetterTile(coord).points;
        });
    }

    static addWordMultiplierPoints(word: Word, points: number, gameboard: Gameboard) {
        word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'MOT' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                points *= gameboard.getLetterTile(coord).multiplier.number;
        });
    }
}
