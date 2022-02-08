/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Letter } from '@app/letter';
import { Service } from 'typedi';
import { GameBoard } from '../classes/gameboard.class';

@Service()
export class BoxMultiplier {
    letterMultipliersByTwo: GameboardCoordinate[] = [
        new GameboardCoordinate(3, 0, <Letter>{}),
        new GameboardCoordinate(11, 0, <Letter>{}),
        new GameboardCoordinate(6, 2, <Letter>{}),
        new GameboardCoordinate(8, 2, <Letter>{}),
        new GameboardCoordinate(0, 3, <Letter>{}),
        new GameboardCoordinate(7, 3, <Letter>{}),
        new GameboardCoordinate(14, 3, <Letter>{}),
        new GameboardCoordinate(2, 6, <Letter>{}),
        new GameboardCoordinate(6, 6, <Letter>{}),
        new GameboardCoordinate(8, 6, <Letter>{}),
        new GameboardCoordinate(12, 6, <Letter>{}),
        new GameboardCoordinate(3, 7, <Letter>{}),
        new GameboardCoordinate(11, 7, <Letter>{}),
        new GameboardCoordinate(2, 8, <Letter>{}),
        new GameboardCoordinate(6, 8, <Letter>{}),
        new GameboardCoordinate(8, 8, <Letter>{}),
        new GameboardCoordinate(12, 8, <Letter>{}),
        new GameboardCoordinate(0, 11, <Letter>{}),
        new GameboardCoordinate(7, 11, <Letter>{}),
        new GameboardCoordinate(14, 11, <Letter>{}),
        new GameboardCoordinate(6, 12, <Letter>{}),
        new GameboardCoordinate(8, 12, <Letter>{}),
        new GameboardCoordinate(3, 14, <Letter>{}),
        new GameboardCoordinate(11, 14, <Letter>{}),
    ];

    letterMultipliersByThree: GameboardCoordinate[] = [
        new GameboardCoordinate(5, 1, <Letter>{}),
        new GameboardCoordinate(9, 1, <Letter>{}),
        new GameboardCoordinate(1, 5, <Letter>{}),
        new GameboardCoordinate(5, 5, <Letter>{}),
        new GameboardCoordinate(9, 5, <Letter>{}),
        new GameboardCoordinate(13, 5, <Letter>{}),
        new GameboardCoordinate(1, 9, <Letter>{}),
        new GameboardCoordinate(5, 9, <Letter>{}),
        new GameboardCoordinate(9, 9, <Letter>{}),
        new GameboardCoordinate(13, 9, <Letter>{}),
        new GameboardCoordinate(5, 13, <Letter>{}),
        new GameboardCoordinate(9, 13, <Letter>{}),
    ];

    wordMultipliersByTwo: GameboardCoordinate[] = [
        new GameboardCoordinate(1, 1, <Letter>{}),
        new GameboardCoordinate(2, 2, <Letter>{}),
        new GameboardCoordinate(3, 3, <Letter>{}),
        new GameboardCoordinate(4, 4, <Letter>{}),
        new GameboardCoordinate(10, 4, <Letter>{}),
        new GameboardCoordinate(11, 3, <Letter>{}),
        new GameboardCoordinate(12, 2, <Letter>{}),
        new GameboardCoordinate(13, 1, <Letter>{}),
        new GameboardCoordinate(1, 13, <Letter>{}),
        new GameboardCoordinate(2, 12, <Letter>{}),
        new GameboardCoordinate(3, 11, <Letter>{}),
        new GameboardCoordinate(4, 10, <Letter>{}),
    ];

    wordMultipliersByThree: GameboardCoordinate[] = [
        new GameboardCoordinate(0, 0, <Letter>{}),
        new GameboardCoordinate(7, 0, <Letter>{}),
        new GameboardCoordinate(14, 0, <Letter>{}),
        new GameboardCoordinate(0, 7, <Letter>{}),
        new GameboardCoordinate(7, 7, <Letter>{}),
        new GameboardCoordinate(14, 7, <Letter>{}),
        new GameboardCoordinate(0, 14, <Letter>{}),
        new GameboardCoordinate(7, 14, <Letter>{}),
        new GameboardCoordinate(14, 14, <Letter>{}),
    ];

    applyBoxMultipliers(gameboard: GameBoard) {
        this.letterMultipliersByTwo.forEach((multiplyLetterByTwoPosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyLetterByTwoPosition);
            gameboardCoord.letterMultiplier = 2;
        });

        this.letterMultipliersByThree.forEach((multiplyLetterByThreePosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyLetterByThreePosition);
            gameboardCoord.letterMultiplier = 3;
        });

        this.wordMultipliersByTwo.forEach((multiplyWordByTwoPosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyWordByTwoPosition);
            gameboardCoord.wordMultiplier = 2;
        });

        this.wordMultipliersByThree.forEach((multiplyWordByThreePosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyWordByThreePosition);
            gameboardCoord.wordMultiplier = 3;
        });
    }
}
