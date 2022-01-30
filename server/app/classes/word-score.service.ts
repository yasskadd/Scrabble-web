/* eslint-disable prettier/prettier */
import { Service } from 'typedi/types/decorators/service.decorator';
import { Coordinate } from './gameboard-coordinate.class';
import { GameBoard } from './gameboard.service';
import { Letter } from './letter';
import { Word } from './word';

@Service()
export class ScoreService {
    calculateWordScore(lettersEntered: Coordinate[], gameBoard: GameBoard, word: Word) {
        // lettersEntered represent the letters the user placed on the board during his last turn
        // Run through each box and verify if there is a multiplier. If there is, verify that it corresponds to lettersEntered coord
        const index = 0;
        let totalScore = 0;
        const wordMultiplierList: number[] = new Array();
        word.coordsInOrder.forEach((coordinate: Coordinate) => {
            const letter: Letter = word.lettersInOrder[index];
            const squareIndex: number = gameBoard.findArrayIndex(coordinate);
            if (gameBoard.getGameBoard()[squareIndex].isLetterMultiplier && lettersEntered.includes(coordinate)) {
                totalScore += letter.points * gameBoard.getGameBoard()[squareIndex].getPointsMultiplier();
            } else {
                totalScore += letter.points;
            }

            if (gameBoard.getGameBoard()[squareIndex].isWordMultiplier && lettersEntered.includes(coordinate)) {
                wordMultiplierList.push(gameBoard.getGameBoard()[squareIndex].getPointsMultiplier());
            }
        });
        if (wordMultiplierList.length !== 0) {
            wordMultiplierList.forEach((multiplier) => {
                totalScore *= multiplier;
            });
        }
        return totalScore;
    }
}
