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
    gameboardCoords: LetterTile[] = new Array();

    constructor(@Inject() private boxMultiplierService: BoxMultiplierService) {
        this.createLetterTiles();
        this.boxMultiplierService.applyBoxMultipliers(this);
    }

    createLetterTiles() {
        for (let i = 1; i <= ROW_NUMBERS; i++) {
            for (let j = 1; j <= COLUMN_NUMBERS; j++) {
                const letter: Letter = {} as Letter;
                const coord: LetterTile = new LetterTile(j, i, letter);
                this.gameboardCoords.push(coord);
            }
        }
    }

    getCoord(coord: Coordinate) {
        if (coord.x > ROW_NUMBERS || coord.x < 1 || coord.y > ROW_NUMBERS || coord.y < 1) return {} as LetterTile;
        return this.gameboardCoords.filter((gameboardCoord) => {
            return gameboardCoord.x === coord.x && gameboardCoord.y === coord.y;
        })[0];
    }

    placeLetter(letterCoord: LetterTile) {
        this.getCoord(letterCoord).letter = letterCoord.letter;
        this.getCoord(letterCoord).isOccupied = true;
    }

    removeLetter(letterCoord: Coordinate) {
        this.getCoord(letterCoord).letter = {} as Letter;
        this.getCoord(letterCoord).isOccupied = false;
    }

    validateGameboardCoordinate(commandInfo: CommandInfo, gameboard: Gameboard): LetterTile[] {
        if (!this.isFirstCoordValid(commandInfo.firstCoordinate, gameboard)) return [];
        const coordOfLetters: LetterTile[] = new Array();
        let stringLength: number = commandInfo.lettersPlaced.length;
        let currentCoord: LetterTile = gameboard.getCoord(commandInfo.firstCoordinate);
        if (commandInfo.direction === 'h') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                currentCoord = new LetterTile(currentCoord.x + 1, currentCoord.y, currentCoord.letter);
            }
        } else if (commandInfo.direction === 'v') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
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
        if (!this.verifyLettersContact(coordOfLetters, gameboard)) return [];
        return coordOfLetters;
    }

    private isFirstCoordValid(firstCoord: Coordinate, gameboard: Gameboard): boolean {
        if (Object.keys(gameboard.getCoord(firstCoord)).length === 0 || gameboard.getCoord(firstCoord) === undefined) return false;
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }

    private isThereAdjacentLetters(letterCoord: LetterTile, gameboard: Gameboard): boolean {
        let isValid = false;
        if (letterCoord.y !== 1) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x, letterCoord.y - 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.y !== ROW_NUMBERS) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x, letterCoord.y + 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== COLUMN_NUMBERS) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x - 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== 1) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x + 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        return isValid;
    }

    private verifyLettersContact(letterCoords: LetterTile[], gameboard: Gameboard): boolean {
        if (gameboard.gameboardCoords.every((coord) => coord.isOccupied === false)) return true;
        for (const coord of letterCoords) {
            if (this.isThereAdjacentLetters(coord, gameboard)) return true;
        }
        return false;
    }
}
