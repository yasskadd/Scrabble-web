import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Letter } from '@app/letter';
import { Service } from 'typedi';

@Service()
export class GameboardCoordinateValidationService {
    validateGameboardCoordinate(commandInfo: CommandInfo, gameboard: GameBoard) {
        // Validate firstCoord
        if (!this.isFirstCoordValid(commandInfo.firstCoordinate, gameboard)) {
            return [];
        }
        const coordOfLetters = new Array();
        let stringLength: number = commandInfo.lettersPlaced.length;
        let currentCoord: GameboardCoordinate = gameboard.getCoord(commandInfo.firstCoordinate);
        const direction = commandInfo.direction;
        if (direction === 'h') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = {} as Letter;
                    letter.stringChar = commandInfo.lettersPlaced.shift() as string;
                    coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                currentCoord = new GameboardCoordinate(x + 1, y, {} as Letter);
            }
        } else if (direction === 'v') {
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = {} as Letter;
                    letter.stringChar = commandInfo.lettersPlaced.shift() as string;
                    coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                currentCoord = new GameboardCoordinate(x, y + 1, {} as Letter);
            }
        } else {
            // We take into consideration that there is only one placed letter
            const letter = {} as Letter;
            letter.stringChar = commandInfo.lettersPlaced.shift() as string;
            coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
        }
        return coordOfLetters;
    }
    isFirstCoordValid(firstCoord: GameboardCoordinate, gameboard: GameBoard) {
        // eslint-disable-next-line no-console
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }
}
