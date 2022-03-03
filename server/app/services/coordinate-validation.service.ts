import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const COLUMN_NUMBER = 15;
const ROW_NUMBER = 15;
@Service()
export class GameboardCoordinateValidationService {
    validateGameboardCoordinate(commandInfo: CommandInfo, gameboard: Gameboard): LetterTile[] {
        if (!this.isFirstCoordValid(commandInfo.firstCoordinate, gameboard)) return [];
        const coordOfLetters: LetterTile[] = new Array();
        let stringLength: number = commandInfo.lettersPlaced.length;
        let currentCoord: LetterTile = gameboard.getCoord(commandInfo.firstCoordinate);
        const direction = commandInfo.direction;
        const lettersPlaced: string[] = commandInfo.lettersPlaced.slice();
        if (direction === 'h') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = { value: lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const coordinate: LetterTile = new LetterTile(currentCoord.x + 1, currentCoord.y, currentCoord.letter);
                currentCoord = coordinate;
            }
        } else if (direction === 'v') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = { value: lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const coordinate: LetterTile = new LetterTile(currentCoord.x, currentCoord.y + 1, currentCoord.letter);
                currentCoord = coordinate;
            }
        } else {
            const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
            coordOfLetters.push(new LetterTile(currentCoord.x, currentCoord.y, letter));
        }

        if (!this.verifyLettersContact(coordOfLetters, gameboard)) return [];
        return coordOfLetters;
    }

    private isFirstCoordValid(firstCoord: LetterTile, gameboard: Gameboard): boolean {
        if (Object.keys(gameboard.getCoord(firstCoord)).length === 0 || gameboard.getCoord(firstCoord) === undefined) return false;
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }

    private isThereAdjacentLetters(letterCoord: LetterTile, gameboard: Gameboard): boolean {
        let isValid = false;
        if (letterCoord.y !== 1) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x, letterCoord.y - 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.y !== ROW_NUMBER) {
            if (gameboard.getCoord(new LetterTile(letterCoord.x, letterCoord.y + 1, {} as Letter)).isOccupied) isValid = true;
        }
        if (letterCoord.x !== COLUMN_NUMBER) {
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
