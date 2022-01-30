/* eslint-disable prettier/prettier */
import { Coordinate } from 'app/classes/gameboard-coordinate.class';
import { Service } from 'typedi';
import { GameBoard } from './gameboard.service';

@Service()
export class PlacementValidationService {
    // Logic : after a player's turn, verify if the letters placed by the user respect Scrabble rules
    // letters placed need all to be in the same line or same column
    //

    validatePlacement(letterCoordList: Coordinate[], gameBoard: GameBoard) {
        if (letterCoordList === undefined || letterCoordList.length === 0) {
            // Verify if there is an adjacent letter placed horizontally and vertically
        }
        let isValidPlacement = false;
        const direction: string = Coordinate.checkDirectionWord(letterCoordList);

        if (direction === 'Horizontal') {
            // Filter coordList to make them in order from left to right
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            letterCoordList.sort((a, b) => (a.getX() < b.getX() ? -1 : 1));
            // Verify for each coord if there is an adjacent box from left or right
            // First letter
            let rightSquareIndex: number = gameBoard.getAdjacentBoxIndex(letterCoordList[0], 'Right');
            if (!gameBoard[rightSquareIndex].getOccupy()) {
                return isValidPlacement;
            }
            // Last letter
            let leftSquareIndex: number = gameBoard.getAdjacentBoxIndex(letterCoordList[letterCoordList.length - 1], 'Left');
            if (!gameBoard[leftSquareIndex].getOccupy()) {
                return isValidPlacement;
            }
            // Letters between first and last
            letterCoordList.pop();
            letterCoordList.shift();
            letterCoordList.forEach((letterCoord: Coordinate) => {
                rightSquareIndex = gameBoard.getAdjacentBoxIndex(letterCoord, 'Right');
                leftSquareIndex = gameBoard.getAdjacentBoxIndex(letterCoord, 'Left');
                if (!gameBoard.getGameBoard[rightSquareIndex].getOccupy() || !gameBoard.getGameBoard[leftSquareIndex].getOccupy()) {
                    return isValidPlacement;
                }
                isValidPlacement = true;
                return isValidPlacement;
            });
        } else if (direction === 'Vertical') {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            letterCoordList.sort((a, b) => (a.getY() < b.getY() ? -1 : 1));
        }
    }
}
