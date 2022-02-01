/* eslint-disable prettier/prettier */
import { Service } from 'typedi';
import { Coordinate } from '../classes/coordinate.class';
import { GameBoard } from '../classes/gameboard.class';
import { Letter } from '../letter';

@Service()
export class WordFinderService {
    // Logic implemented in order to search for newly formed words after Player validates action

    static readonly VERTICAL_MOVEMENT: number = 15;

    private findNewWords(gameBoard: GameBoard, coordList: Coordinate[]) {
        let newWordsArray: string[];
        // Verify if word is vertical or horizontal if coordList is > 1
        coordList.forEach((coord) => {
            const mostLeftCoord: Coordinate = gameBoard.getCoord(coord);
            const mostUpCoord: Coordinate = gameBoard.getCoord(coord);
            if (coordList.length === 1) {
                const verticalWord: string = this.buildVerticalWord(gameBoard, mostLeftIndex);
                const horizontalWord: string = this.buildHorizontal(gameBoard, mostUpIndex);
                if (verticalWord !== '') {
                    newWordsArray.push(verticalWord);
                } else if (horizontalWord !== '') {
                    newWordsArray.push(horizontalWord);
                }
                return newWordsArray;
            }
            const direction: string = Coordinate.checkDirectionWord(coordList) as string;
            if (direction === 'Horizontal') {
                const newWord: string = this.buildVerticalWord(gameBoard, mostUpIndex);
                // Construct word from the letterArray and add it to newWords array
                if (newWord !== '') {
                    newWordsArray.push(newWord);
                }
            } else if (direction === 'Vertical') {
                const newWord: string = this.buildHorizontal(gameBoard, mostLeftIndex);
                // Construct word from the letterArray and add it to newWords array
                if (newWord !== '') {
                    newWordsArray.push(newWord);
                }
            }
            return newWordsArray;
        });
    }

    private buildVerticalWord(gameBoard: GameBoard, mostUpCoord: Coordinate) {
        while (gameBoard.getCoord(mostUpCoord).isOccupied && gameBoard.getGameBoard()[mostUpIndex + 15] !== undefined) {
            // Need method to get adjacentCoordinate in the board
            mostUpIndex += 15;
        }
        const letterArray: Letter[] = new Array();
        letterArray.push(gameBoard.getLetterArray[mostUpIndex]);
        while (gameBoard.getLetterArray()[mostUpIndex - 15].char !== '' && gameBoard.getLetterArray()[mostUpIndex - 15] !== undefined) {
            mostUpIndex -= 15;
            letterArray.push(gameBoard.getLetterArray()[mostUpIndex - 15]);
        }
        // Construct word from the letterArray
        if (letterArray.length > 1) {
            const newWord: string = letterArray.join('');
            return newWord;
        } else {
            return '';
        }
    }

    private buildHorizontal(gameBoard: GameBoard, mostLeftIndex: number) {
        while (gameBoard.getGameBoard()[mostLeftIndex - 1].getOccupy() && gameBoard.getGameBoard()[mostLeftIndex - 1] !== undefined) {
            mostLeftIndex -= 1;
        }
        const letterArray: Letter[] = new Array();
        letterArray.push(gameBoard.getLetterArray[mostLeftIndex]);
        while (gameBoard.getLetterArray()[mostLeftIndex + 1].char !== '' && gameBoard.getLetterArray()[mostLeftIndex + 1] !== undefined) {
            mostLeftIndex += 1;
            letterArray.push(gameBoard.getLetterArray()[mostLeftIndex + 1]);
        }
        // Construct word from the letterArray and add it to newWords array
        if (letterArray.length > 1) {
            const newWord: string = letterArray.join('');
            return newWord;
        } else {
            return '';
        }
    }
}
