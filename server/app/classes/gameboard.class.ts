/* eslint-disable prettier/prettier */
import { CommandInfo } from '@app/command-info';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
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
                const letterTile: LetterTile = new LetterTile({ x: i, y: j });
                this.gameboardTiles.push(letterTile);
            }
        }
    }

    getLetterTile(coord: Coordinate) {
        return this.gameboardTiles.filter((gameboardTile) => {
            return gameboardTile.coordinate === coord;
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
        let stringLength: number = commandInfo.lettersPlaced.length;
        let currentCoord: LetterTile = this.getCoord(commandInfo.firstCoordinate);
        if (commandInfo.direction === 'h') {
            while (stringLength !== 0) {
                if (Object.keys(this.getCoord(currentCoord)).length === 0 || this.getCoord(currentCoord) === undefined) return [];
                if (!this.getCoord(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                currentCoord = new LetterTile(currentCoord.x + 1, currentCoord.y, currentCoord.letter);
            }
        } else if (commandInfo.direction === 'v') {
            while (stringLength !== 0) {
                if (Object.keys(this.getCoord(currentCoord)).length === 0 || this.getCoord(currentCoord) === undefined) return [];
                if (!this.getCoord(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                currentCoord = new LetterTile(currentCoord.x, currentCoord.y + 1, currentCoord.letter);
            }
        } else {
            const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
            coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
        }
        if (!this.verifyLettersContact(coordOfLetters)) return [];
        return coordOfLetters;
    }

    private isFirstCoordValid(firstCoord: Coordinate): boolean {
        if (Object.keys(this.getCoord(firstCoord)).length === 0 || this.getCoord(firstCoord) === undefined) return false;
        return this.getCoord(firstCoord).isOccupied ? false : true;
    }

    private isThereAdjacentLetters(letterCoord: LetterTile): boolean {
        let isValid = false;
        if (letterCoord.y !== 1) {
            if (this.getCoord(new LetterTile(letterCoord.x, letterCoord.y - 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.y !== ROW_NUMBERS) {
            if (this.getCoord(new LetterTile(letterCoord.x, letterCoord.y + 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== COLUMN_NUMBERS) {
            if (this.getCoord(new LetterTile(letterCoord.x - 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== 1) {
            if (this.getCoord(new LetterTile(letterCoord.x + 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        return isValid;
    }

    private verifyLettersContact(letterCoords: LetterTile[]): boolean {
        if (this.gameboardCoords.every((coord) => coord.isOccupied === false)) return true;
        for (const coord of letterCoords) {
            if (this.isThereAdjacentLetters(coord)) return true;
        }
        return false;
    }
}
