/* eslint-disable prettier/prettier */
import { Service } from 'typedi';
import { Coordinate } from '../classes/coordinate.class';
import { Letter } from '../classes/letter.class';

@Service()
export class GameBoard {
    private gameboardCoords: Coordinate[];
    private letterArray: Letter[] = new Array();

    // GameBoard creation
    constructor() {
        // matrix 15x15
        const rowNumbers = 15;
        const columnNumbers = 15;
        for (let i = 0; i < rowNumbers; i++) {
            for (let j = 0; j < columnNumbers; j++) {
                const coord: Coordinate = new Coordinate(i, j, null);
                this.gameboardCoords.push(coord);
            }
        }
        this.applyBoxMultipliers();
    }

    getGameBoard() {
        return this.gameboardCoords;
    }

    getGameBoardCoord(wantedCoord: Coordinate) {
        return this.gameboardCoords.filter((coord) => coord == wantedCoord)[0];
    }

    getLetterArray() {
        return this.letterArray;
    }

    findGameboardIndex(position: Coordinate) {
        return (position.getX() % 14) + position.getY() + 1;
    }

    placeLetter(letter: Letter, position: Coordinate) {
        // Verify if box is occupied.
        const index: number = this.findArrayIndex(position);
        if (this.gameboardCoords[index].getOccupy()) {
            return;
        } else {
            this.gameboardCoords[index].setOccupy(true);
            this.letterArray[index] = letter;
        }
    }

    // removeLetter(position: Coordinate) {
    //     // Verify if box is occupied
    //     const index: number = this.findArrayIndex(position);
    //     if (this.gameBoard[index].getOccupy()) {
    //         return;
    //     } else {
    //         this.gameBoard[index].setOccupy(false);
    //     }
    // }

    applyBoxMultipliers() {
        const word3PosList: Coordinate[] = [
            new Coordinate(0, 0, <Letter>{}),
            new Coordinate(7, 0, <Letter>{}),
            new Coordinate(14, 0, <Letter>{}),
            new Coordinate(0, 7, <Letter>{}),
            new Coordinate(7, 7, <Letter>{}),
            new Coordinate(14, 7, <Letter>{}),
            new Coordinate(0, 14, <Letter>{}),
            new Coordinate(7, 14, <Letter>{}),
            new Coordinate(14, 14, <Letter>{}),
        ];
        word3PosList.forEach((position) => {
            const index = this.findArrayIndex(position);
            this.gameBoard[index].setWordMultiplier(3, true);
        });
        const word2PosList: Coordinate[] = [
            new Coordinate(1, 1, <Letter>{}),
            new Coordinate(2, 2, <Letter>{}),
            new Coordinate(3, 3, <Letter>{}),
            new Coordinate(4, 4, <Letter>{}),
            new Coordinate(10, 4, <Letter>{}),
            new Coordinate(11, 3, <Letter>{}),
            new Coordinate(12, 2, <Letter>{}),
            new Coordinate(13, 1, <Letter>{}),
            new Coordinate(1, 13, <Letter>{}),
            new Coordinate(2, 12, <Letter>{}),
            new Coordinate(3, 11, <Letter>{}),
            new Coordinate(4, 10, <Letter>{}),
        ];
        word2PosList.forEach((position) => {
            const index = this.findArrayIndex(position);
            this.gameBoard[index].setWordMultiplier(2, true);
        });
        const letter2List: Coordinate[] = [
            new Coordinate(3, 0, <Letter>{}),
            new Coordinate(11, 0, <Letter>{}),
            new Coordinate(6, 2, <Letter>{}),
            new Coordinate(8, 2, <Letter>{}),
            new Coordinate(0, 3, <Letter>{}),
            new Coordinate(7, 3, <Letter>{}),
            new Coordinate(14, 3, <Letter>{}),
            new Coordinate(2, 6, <Letter>{}),
            new Coordinate(6, 6, <Letter>{}),
            new Coordinate(8, 6, <Letter>{}),
            new Coordinate(12, 6, <Letter>{}),
            new Coordinate(3, 7, <Letter>{}),
            new Coordinate(11, 7, <Letter>{}),
            new Coordinate(2, 8, <Letter>{}),
            new Coordinate(6, 8, <Letter>{}),
            new Coordinate(8, 8, <Letter>{}),
            new Coordinate(12, 8, <Letter>{}),
            new Coordinate(0, 11, <Letter>{}),
            new Coordinate(7, 11, <Letter>{}),
            new Coordinate(14, 11, <Letter>{}),
            new Coordinate(6, 12, <Letter>{}),
            new Coordinate(8, 12, <Letter>{}),
            new Coordinate(3, 14, <Letter>{}),
            new Coordinate(11, 14, <Letter>{}),
        ];
        letter2List.forEach((position) => {
            const index = this.findArrayIndex(position);
            this.gameBoard[index].setLetterMultiplier(2, true);
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
            const index = this.findArrayIndex(position);
            this.gameBoard[index].setLetterMultiplier(3, true);
        });
    }

    getAdjacentBoxIndex(coord: Coordinate, direction: string) {
        const directions: string[] = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
        if (directions.includes(direction)) {
            if (direction === 'UP') {
                coord.setY(coord.getY() + 1);
                this.findArrayIndex(coord);
            }
            if (direction === 'DOWN') {
                coord.setY(coord.getY() - 1);
                return this.findArrayIndex(coord);
            }
            if (direction === 'DOWN') {
                coord.setY(coord.getY() - 1);
                return this.findArrayIndex(coord);
            }
            if (direction === 'RIGHT') {
                coord.setX(coord.getX() + 1);
                return this.findArrayIndex(coord);
            }
            if (direction === 'LEFT') {
                coord.setX(coord.getX() - 1);
                return this.findArrayIndex(coord);
            }
        } else {
            throw new Error("It's not a valid direction");
        }
    }
}
