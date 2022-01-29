/* eslint-disable prettier/prettier */
import { Coordinate } from '@app/classes/gameboard-coordinate.class';
import { Box } from '@app/classes/gameboard-square.class';
import { Letter } from '@app/classes/letter';
import { Service } from 'typedi';

@Service()
export class GameBoard {
    private gameBoard: Box[] = new Array();
    private letterArray: Letter[] = new Array();

    // GameBoard creation
    constructor() {
        // matrix 15x15
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let i = 0; i < rowNumbers; i++) {
            for (let j = 0; j < columnNumbers; j++) {
                const boxCoords: Coordinate = new Coordinate(i, j);
                const box: Box = new Box(boxCoords);
                this.gameBoard.push(box);
            }
        }
        this.applyBoxMultipliers();
    }

    getGameBoard() {
        return this.gameBoard;
    }

    getLetterArray() {
        return this.letterArray;
    }

    findGameBoardIndex(position: Coordinate) {
        return position.getX() * 14 + position.getY() + 1;
    }

    placeLetter(letter: Letter, position: Coordinate) {
        // Verify if box is occupied.
        const index: number = this.findGameBoardIndex(position);
        if (this.gameBoard[index].getOccupy()) {
            return;
        } else {
            this.gameBoard[index].setOccupy(true);
            this.letterArray[index] = letter;
        }
    }

    // removeLetter(position: Coordinate) {
    //     // Verify if box is occupied
    //     const index: number = this.findGameBoardIndex(position);
    //     if (this.gameBoard[index].getOccupy()) {
    //         return;
    //     } else {
    //         this.gameBoard[index].setOccupy(false);
    //     }
    // }

    applyBoxMultipliers() {
        const word3PosList: Coordinate[] = [
            new Coordinate(0, 0),
            new Coordinate(7, 0),
            new Coordinate(14, 0),
            new Coordinate(0, 7),
            new Coordinate(7, 7),
            new Coordinate(14, 7),
            new Coordinate(0, 14),
            new Coordinate(7, 14),
            new Coordinate(14, 14),
        ];
        word3PosList.forEach((position) => {
            const index = this.findGameBoardIndex(position);
            this.gameBoard[index].setMultiplier(3, true);
        });
        const word2PosList: Coordinate[] = [
            new Coordinate(1, 1),
            new Coordinate(2, 2),
            new Coordinate(3, 3),
            new Coordinate(4, 4),
            new Coordinate(10, 4),
            new Coordinate(11, 3),
            new Coordinate(12, 2),
            new Coordinate(13, 1),
            new Coordinate(1, 13),
            new Coordinate(2, 12),
            new Coordinate(3, 11),
            new Coordinate(4, 10),
        ];
        word2PosList.forEach((position) => {
            const index = this.findGameBoardIndex(position);
            this.gameBoard[index].setMultiplier(2, true);
        });
        const letter2List: Coordinate[] = [
            new Coordinate(3, 0),
            new Coordinate(11, 0),
            new Coordinate(6, 2),
            new Coordinate(8, 2),
            new Coordinate(0, 3),
            new Coordinate(7, 3),
            new Coordinate(14, 3),
            new Coordinate(2, 6),
            new Coordinate(6, 6),
            new Coordinate(8, 6),
            new Coordinate(12, 6),
            new Coordinate(3, 7),
            new Coordinate(11, 7),
            new Coordinate(2, 8),
            new Coordinate(6, 8),
            new Coordinate(8, 8),
            new Coordinate(12, 8),
            new Coordinate(0, 11),
            new Coordinate(7, 11),
            new Coordinate(14, 11),
            new Coordinate(6, 12),
            new Coordinate(8, 12),
            new Coordinate(3, 14),
            new Coordinate(11, 14),
        ];
        letter2List.forEach((position) => {
            const index = this.findGameBoardIndex(position);
            this.gameBoard[index].setMultiplier(2, false);
        });
        const letter3List: Coordinate[] = [
            new Coordinate(5, 1),
            new Coordinate(9, 1),
            new Coordinate(1, 5),
            new Coordinate(5, 5),
            new Coordinate(9, 5),
            new Coordinate(13, 5),
            new Coordinate(1, 9),
            new Coordinate(5, 9),
            new Coordinate(9, 9),
            new Coordinate(13, 9),
            new Coordinate(5, 13),
            new Coordinate(9, 13),
        ];
        letter3List.forEach((position) => {
            const index = this.findGameBoardIndex(position);
            this.gameBoard[index].setMultiplier(3, false);
        });
    }

    getAdjacentBoxIndex(coord: Coordinate, direction: string) {
        const directions: string[] = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
        if (directions.includes(direction)) {
            if (direction === 'UP') {
                coord.setY(coord.getY() + 1);
                this.findGameBoardIndex(coord);
            }
            if (direction === 'DOWN') {
                coord.setY(coord.getY() - 1);
                return this.findGameBoardIndex(coord);
            }
            if (direction === 'DOWN') {
                coord.setY(coord.getY() - 1);
                return this.findGameBoardIndex(coord);
            }
            if (direction === 'RIGHT') {
                coord.setX(coord.getX() + 1);
                return this.findGameBoardIndex(coord);
            }
            if (direction === 'LEFT') {
                coord.setX(coord.getX() - 1);
                return this.findGameBoardIndex(coord);
            }
        } else {
            throw new Error("It's not a valid direction");
        }
    }
}
