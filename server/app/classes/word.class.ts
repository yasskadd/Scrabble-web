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

    // TODO: check how many times setWordAttributes() is called. Something is sus.
    private setWordAttributes(firstCoord: Coordinate, commandLetters: string[], gameboard: Gameboard) {
        let position = { ...firstCoord };
        let commandLettersCopy = commandLetters.slice();
        if (commandLettersCopy[0] === '') commandLettersCopy.shift();

        while ((commandLettersCopy.length > 0 || gameboard.getLetterTile(position).isOccupied) && this.isWithinBoardLimits(position)) {
            if (!gameboard.getLetterTile(position).isOccupied) {
                this.stringFormat += commandLettersCopy[0];
                commandLettersCopy.shift();
                this.wordCoords.push({ ...position });
                this.newLetterCoords.push({ ...position });
            } else {
                this.wordCoords.push({ ...position });
                this.stringFormat += gameboard.getLetterTile({ ...position }).letter;
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
            const fakeCommandInfo: CommandInfo = {
                firstCoordinate: { ...coord },
                isHorizontal: !word.isHorizontal,
                letters: [''],
            };
            const newWord = new Word(fakeCommandInfo, gameboard);
            if (newWord.wordCoords.length !== 1) allWords.push(newWord);
        });
        allWords.forEach((word) => {});
        allWords.forEach((word) => {});
        return allWords;
    }

    // CALCULATE POINTS ----------------------------------------------------------------------------------------------------
    public calculateWordPoints(gameboard: Gameboard): number {
        this.addLetterPoints(gameboard);
        this.addWordMultiplierPoints(gameboard);
        return this.points;
    }

    private addLetterPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.newLetterCoords.filter((newLetterCoord) => coord.x === newLetterCoord.x && coord.y === newLetterCoord.y).length === 1
            )
                this.points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
            else this.points += gameboard.getLetterTile(coord).points;
        });
    }

    private addWordMultiplierPoints(gameboard: Gameboard) {
        this.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'MOT' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.newLetterCoords.filter((newLetterCoord) => coord.x === newLetterCoord.x && coord.y === newLetterCoord.y).length === 1
            )
                this.points *= gameboard.getLetterTile(coord).multiplier.number;
        });
    }
}
