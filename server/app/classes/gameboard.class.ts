/* eslint-disable prettier/prettier */
import { CommandInfo } from '@app/command-info';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Inject } from 'typedi';

const ROW_NUMBERS = 15;
const COLUMN_NUMBERS = 15;

export class Gameboard {
    gameboardTiles: LetterTile[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplierService) {
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createLetterTiles() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                const letter: Letter = {} as Letter;
                const coord: LetterTile = new LetterTile(j, i, letter);
                this.gameboardTiles.push(coord);
            }
        }
    }

    getLetterTile(coord: Coordinate) {
        if (coord.x > ROW_NUMBERS || coord.x < 1 || coord.y > ROW_NUMBERS || coord.y < 1) return {} as LetterTile;
        return this.gameboardTiles.filter((gameboardCoord) => {
            return gameboardCoord.x === coord.x && gameboardCoord.y === coord.y;
        })[0];
    }

    placeLetter(position: Coordinate, letter: string) {
        this.getLetterTile(position).setLetter(letter);
        this.getLetterTile(position).isOccupied = true;
    }

    removeLetter(position: Coordinate) {
        this.getLetterTile(position).setLetter('');
        this.getLetterTile(position).isOccupied = false;
    }

    validateGameboardCoordinate(commandInfo: CommandInfo): LetterTile[] {
        if (!this.isFirstCoordValid(commandInfo.firstCoordinate)) return [];
        const coordOfLetters: LetterTile[] = new Array();
        let stringLength: number = commandInfo.letters.length;
        let currentCoord: LetterTile = this.getLetterTile(commandInfo.firstCoordinate);
        if (commandInfo.isHorizontal) {
            while (stringLength !== 0) {
                if (Object.keys(this.getLetterTile(currentCoord)).length === 0 || this.getLetterTile(currentCoord) === undefined) return [];
                if (!this.getLetterTile(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.letters.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                currentCoord = new LetterTile(currentCoord.x + 1, currentCoord.y, currentCoord.letter);
            }
        } else if (!commandInfo.isHorizontal) {
            while (stringLength !== 0) {
                if (Object.keys(this.getLetterTile(currentCoord)).length === 0 || this.getLetterTile(currentCoord) === undefined) return [];
                if (!this.getLetterTile(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.letters.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                currentCoord = new LetterTile(currentCoord.x, currentCoord.y + 1, currentCoord.letter);
            }
        } else {
            const letter = { value: commandInfo.letters.shift() as string } as Letter;
            coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
        }
        if (!this.verifyLettersContact(coordOfLetters)) return [];
        return coordOfLetters;
    }

    private isFirstCoordValid(firstCoord: Coordinate): boolean {
        if (Object.keys(this.getLetterTile(firstCoord)).length === 0 || this.getLetterTile(firstCoord) === undefined) return false;
        return this.getLetterTile(firstCoord).isOccupied ? false : true;
    }

    private isThereAdjacentLetters(letterCoord: LetterTile): boolean {
        let isValid = false;
        if (letterCoord.y !== 1) {
            if (this.getLetterTile(new LetterTile(letterCoord.x, letterCoord.y - 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.y !== ROW_NUMBERS) {
            if (this.getLetterTile(new LetterTile(letterCoord.x, letterCoord.y + 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== COLUMN_NUMBERS) {
            if (this.getLetterTile(new LetterTile(letterCoord.x - 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== 1) {
            if (this.getLetterTile(new LetterTile(letterCoord.x + 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        return isValid;
    }

    private verifyLettersContact(letterCoords: LetterTile[]): boolean {
        if (this.gameboardTiles.every((coord) => coord.isOccupied === false)) return true;
        for (const coord of letterCoords) {
            if (this.isThereAdjacentLetters(coord)) return true;
        }
        return false;
    }
}
