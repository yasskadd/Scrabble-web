/* eslint-disable no-restricted-imports */
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { Gameboard } from './gameboard.class';

export class Word {
    isValid: boolean;
    isHorizontal: boolean | undefined;
    stringFormat: string = '';
    points: number;
    newLetterCoords: Coordinate[] = [];
    wordCoords: Coordinate[] = [];

    constructor(commandInfo: CommandInfo, gameboard: Gameboard) {
        this.isValid = true;
        this.isHorizontal = commandInfo.isHorizontal;
        this.points = 0;

        if (commandInfo.isHorizontal === undefined && commandInfo.letters.length === 1) {
            this.setIsHorizontal(commandInfo.firstCoordinate, gameboard);
        }

        const firstCoord = this.findFirstCoord(commandInfo.firstCoordinate, gameboard);
        this.setWordAttributes(firstCoord, commandInfo.letters, gameboard);
    }

    private setIsHorizontal(firstCoord: Coordinate, gameboard: Gameboard) {
        if (this.upDownIsOccupied(gameboard, firstCoord)) this.isHorizontal = false;
        else if (this.leftRightIsOccupied(gameboard, firstCoord)) this.isHorizontal = true;
        else this.isValid = false;
    }

    private upDownIsOccupied(gameboard: Gameboard, firstCoord: Coordinate) {
        return (
            gameboard.getLetterTile({ x: firstCoord.x, y: firstCoord.y-- }).isOccupied ||
            gameboard.getLetterTile({ x: firstCoord.x, y: firstCoord.y++ }).isOccupied
        );
    }

    private leftRightIsOccupied(gameboard: Gameboard, firstCoord: Coordinate) {
        return (
            gameboard.getLetterTile({ x: firstCoord.x--, y: firstCoord.y }).isOccupied ||
            gameboard.getLetterTile({ x: firstCoord.x++, y: firstCoord.y }).isOccupied
        );
    }

    private findFirstCoord(coord: Coordinate, gameboard: Gameboard): Coordinate {
        const backwardPosition = this.isHorizontal ? { x: coord.x - 1, y: coord.y } : { x: coord.x, y: coord.y - 1 };

        if (this.isWithinBoardLimits(backwardPosition) && gameboard.getLetterTile(backwardPosition).isOccupied) {
            while (this.isWithinBoardLimits(backwardPosition) && gameboard.getLetterTile(backwardPosition).isOccupied)
                this.decrementBackwardPosition(backwardPosition);
            this.incrementPosition(backwardPosition);
            return backwardPosition;
        } else return coord;
    }

    private decrementBackwardPosition(backwardPosition: Coordinate) {
        if (this.isHorizontal) backwardPosition.x--;
        else backwardPosition.y--;
    }

    private setWordAttributes(firstCoord: Coordinate, commandLetters: string[], gameboard: Gameboard) {
        let position: Coordinate = { ...firstCoord };
        let commandLettersCopy: string[] = commandLetters.slice();

        if (commandLettersCopy[0] === '') commandLettersCopy.shift();

        while ((commandLettersCopy.length > 0 || gameboard.getLetterTile(position).isOccupied) && this.isWithinBoardLimits(position)) {
            if (!gameboard.getLetterTile(position).isOccupied) this.addNewLetter(position, commandLettersCopy);
            else this.addGameboardLetter(position, gameboard);

            this.incrementPosition(position);
        }

        this.checkValidity(commandLettersCopy);
    }

    private addNewLetter(position: Coordinate, commandLettersCopy: string[]) {
        this.stringFormat += commandLettersCopy[0].toLowerCase();
        commandLettersCopy.shift();
        this.wordCoords.push({ ...position });
        this.newLetterCoords.push({ ...position });
    }

    private addGameboardLetter(position: Coordinate, gameboard: Gameboard) {
        this.wordCoords.push({ ...position });
        this.stringFormat += gameboard.getLetterTile({ ...position }).letter;
    }

    private incrementPosition(position: Coordinate) {
        if (this.isHorizontal) position.x++;
        else position.y++;
    }

    private checkValidity(commandLettersCopy: string[]) {
        if (commandLettersCopy.length !== 0) this.isValid = false;
        if (this.wordCoords.length < 2) this.isValid = false;
    }

    private isWithinBoardLimits(coord: Coordinate): boolean {
        return coord.x >= 1 && coord.x <= 15 && coord.y >= 1 && coord.y <= 15;
    }

    static findAdjacentWords(word: Word, gameboard: Gameboard): Word[] {
        const allWords: Word[] = [];
        allWords.push(word);
        word.newLetterCoords.forEach((coord: Coordinate) => {
            this.pushNewAjacentWord(word, gameboard, coord, allWords);
        });
        return allWords;
    }

    static pushNewAjacentWord(word: Word, gameboard: Gameboard, coord: Coordinate, allWords: Word[]) {
        const newWord = new Word(
            {
                firstCoordinate: coord,
                isHorizontal: !word.isHorizontal,
                letters: [''],
            },
            gameboard,
        );
        if (newWord.wordCoords.length !== 1) allWords.push(newWord);
    }

    public calculateWordPoints(gameboard: Gameboard): number {
        this.addLetterPoints(gameboard);
        this.addWordMultiplierPoints(gameboard);
        return this.points;
    }

    private addLetterPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            if (this.coordHasLetterMultiplier(gameboard, coord) && this.isNewLetterCoord(coord)) this.addLetterPointsWithMultiplier(gameboard, coord);
            else this.addLetterPointsWithoutMultiplier(gameboard, coord);
        });
    }

    private addWordMultiplierPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            if (this.coordHasWordMultiplier(gameboard, coord) && this.isNewLetterCoord(coord)) this.multiplyWordPoints(gameboard, coord);
        });
    }

    private coordHasLetterMultiplier(gameboard: Gameboard, coord: Coordinate): boolean {
        return gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' && gameboard.getLetterTile(coord).multiplier.number > 1;
    }

    private addLetterPointsWithMultiplier(gameboard: Gameboard, coord: Coordinate) {
        this.points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
    }

    private addLetterPointsWithoutMultiplier(gameboard: Gameboard, coord: Coordinate) {
        this.points += gameboard.getLetterTile(coord).points;
    }

    private coordHasWordMultiplier(gameboard: Gameboard, coord: Coordinate): boolean {
        return gameboard.getLetterTile(coord).multiplier.type === 'MOT' && gameboard.getLetterTile(coord).multiplier.number > 1;
    }

    private multiplyWordPoints(gameboard: Gameboard, coord: Coordinate) {
        this.points *= gameboard.getLetterTile(coord).multiplier.number;
    }

    private isNewLetterCoord(coord: Coordinate): boolean {
        return this.newLetterCoords.filter((newLetterCoord) => coord.x === newLetterCoord.x && coord.y === newLetterCoord.y).length === 1;
    }
}
