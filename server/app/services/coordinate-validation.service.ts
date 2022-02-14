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
        return coordOfLetters;
    }
    isFirstCoordValid(firstCoord: GameboardCoordinate, gameboard: Gameboard) {
        if (Object.keys(gameboard.getCoord(firstCoord)).length === 0 || gameboard.getCoord(firstCoord) === undefined) return false;
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }
}
