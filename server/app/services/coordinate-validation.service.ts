import { Coordinate } from '@app/classes/coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Letter } from '@app/letter';
import { Service } from 'typedi';

@Service()
export class CoordinateValidationService {
    validateCoordinate(lettersPlaced: string[], firstCoord: Coordinate, direction: string, gameboard: GameBoard) {
        // Validate firstCoord
        if (!this.isFirstCoordValid(firstCoord, gameboard)) {
            console.log('COORD NOT VALID');
            return [];
        }
        const coordOfLetters = new Array();
        let stringLength: number = lettersPlaced.length;
        let currentCoord: Coordinate = gameboard.getCoord(firstCoord);

        if (direction === 'h') {
            console.log('CALLED H');
            while (stringLength !== 0) {
                if (!gameboard.getCoord(currentCoord).isOccupied) {
                    if (gameboard.getCoord(currentCoord) === undefined) return [];
                    // add letterCoordinate
                    const letter = new Letter();
                    letter.stringChar = lettersPlaced.shift() as string;
                    coordOfLetters.push(new Coordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                currentCoord = new Coordinate(x + 1, y, {} as Letter);
            }
        } else if (direction === 'v') {
            console.log('CALLED V');
            while (stringLength !== 0) {
                if (!gameboard.getCoord(currentCoord).isOccupied && gameboard.getCoord(currentCoord) !== undefined) {
                    if (gameboard.getCoord(currentCoord) === undefined) return [];
                    // add letterCoordinate
                    const letter = new Letter();
                    letter.stringChar = lettersPlaced.shift() as string;
                    coordOfLetters.push(new Coordinate(currentCoord.x, currentCoord.y, letter));
                    stringLength--;
                }
                const x: number = currentCoord.x;
                const y: number = currentCoord.y;
                currentCoord = new Coordinate(x, y + 1, {} as Letter);
            }
        } else {
            // We take into consideration that there is only one placed letter
            console.log('CALLED');
            const letter = new Letter();
            letter.stringChar = lettersPlaced.shift() as string;
            coordOfLetters.push(new Coordinate(currentCoord.x, currentCoord.y, letter));
        }
        return coordOfLetters;
    }
    isFirstCoordValid(firstCoord: Coordinate, gameboard: GameBoard) {
        // eslint-disable-next-line no-console
        console.log(gameboard.getCoord(firstCoord));
        return gameboard.getCoord(firstCoord).isOccupied ? false : true;
    }
}
