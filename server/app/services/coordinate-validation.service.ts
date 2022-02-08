import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Letter } from '@app/letter';
import { Service } from 'typedi';

@Service()
export class GameboardCoordinateValidationService {
    validateGameboardCoordinate(lettersPlaced: string[], firstCoord: GameboardCoordinate, direction: string, gameboard: GameBoard) {
        // Validate firstCoord
        if (!this.isFirstCoordValid(firstCoord, gameboard)) {
            return [];
        }
        const coordOfLetters = new Array();
        let stringLength: number = lettersPlaced.length;
        let currentCoord: GameboardCoordinate = gameboard.getCoord(firstCoord);

        if (direction === 'h') {
            console.log('CALLED');
            while (stringLength !== 0) {
                if (Object.keys(gameboard.getCoord(currentCoord)).length === 0 || gameboard.getCoord(currentCoord) === undefined) return [];
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    const letter = {} as Letter;
                    letter.stringChar = lettersPlaced.shift() as string;
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
                    letter.stringChar = lettersPlaced.shift() as string;
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
            letter.stringChar = lettersPlaced.shift() as string;
            coordOfLetters.push(new GameboardCoordinate(currentCoord.x, currentCoord.y, letter));
        }
        return coordOfLetters;
    }
    isFirstCoordValid(firstCoord: GameboardCoordinate, gameboard: GameBoard) {
        // eslint-disable-next-line no-console
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }
}
