import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

@Service()
export class GameboardCoordinateValidationService {
    validateGameboardCoordinate(commandInfo: CommandInfo, gameboard: Gameboard) {
        // Validate firstCoord
        if (!this.isFirstCoordValid(commandInfo.firstCoordinate, gameboard)) return [];
        const coordOfLetters = new Array();
        let stringLength: number = commandInfo.lettersPlaced.length;
        let currentCoord: GameboardCoordinate = gameboard.getCoord(commandInfo.firstCoordinate);
        const direction = commandInfo.direction;
        if (direction === 'h') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const coordinate: GameboardCoordinate = new GameboardCoordinate(currentCoord.x + 1, currentCoord.y, currentCoord.letter);
                currentCoord = coordinate;
            }
        } else if (direction === 'v') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
                    coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const coordinate: GameboardCoordinate = new GameboardCoordinate(currentCoord.x, currentCoord.y + 1, currentCoord.letter);
                currentCoord = coordinate;
            }
        } else {
            const letter = { value: commandInfo.lettersPlaced.shift() as string } as Letter;
            coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
        }

        if (!this.verifyLettersContact(coordOfLetters, gameboard)) return [];
        return coordOfLetters;
    }
    isFirstCoordValid(firstCoord: GameboardCoordinate, gameboard: Gameboard) {
        if (Object.keys(gameboard.getCoord(firstCoord)).length === 0 || gameboard.getCoord(firstCoord) === undefined) return false;
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }

    isThereAdjacentLetters(letterCoord: GameboardCoordinate, gameboard: GameBoard) {
        let isValid = false;
        // Verify upward
        if (letterCoord.y !== 0) {
            if (gameboard.getCoord(new GameboardCoordinate(letterCoord.x, letterCoord.y - 1, {} as Letter)).isOccupied) isValid = true;
        }
        // Verify downward
        if (letterCoord.y !== 14) {
            if (gameboard.getCoord(new GameboardCoordinate(letterCoord.x, letterCoord.y + 1, {} as Letter)).isOccupied) isValid = true;
        }
        // Verify right
        if (letterCoord.x !== 14) {
            if (gameboard.getCoord(new GameboardCoordinate(letterCoord.x - 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        // Verify left
        if (letterCoord.x !== 0) {
            if (gameboard.getCoord(new GameboardCoordinate(letterCoord.x + 1, letterCoord.y, {} as Letter)).isOccupied) isValid = true;
        }
        return isValid;
    }
    verifyLettersContact(letterCoords: GameboardCoordinate[], gameboard: GameBoard) {
        if (gameboard.gameboardCoords.every((coord) => coord.isOccupied === false)) return true;
        for (const coord of letterCoords) {
            if (this.isThereAdjacentLetters(coord, gameboard)) return true;
        }
        return false;
    }
}
