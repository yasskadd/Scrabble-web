/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Gameboard } from '@app/classes/gameboard.class';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

@Service()
export class BoxMultiplierService {
    letterMultipliersByTwo: GameboardCoordinate[] = [
        new GameboardCoordinate(4, 1, <Letter>{}),
        new GameboardCoordinate(12, 1, <Letter>{}),
        new GameboardCoordinate(7, 3, <Letter>{}),
        new GameboardCoordinate(9, 3, <Letter>{}),
        new GameboardCoordinate(1, 4, <Letter>{}),
        new GameboardCoordinate(8, 4, <Letter>{}),
        new GameboardCoordinate(15, 4, <Letter>{}),
        new GameboardCoordinate(3, 7, <Letter>{}),
        new GameboardCoordinate(7, 7, <Letter>{}),
        new GameboardCoordinate(9, 7, <Letter>{}),
        new GameboardCoordinate(13, 7, <Letter>{}),
        new GameboardCoordinate(4, 8, <Letter>{}),
        new GameboardCoordinate(12, 8, <Letter>{}),
        new GameboardCoordinate(3, 9, <Letter>{}),
        new GameboardCoordinate(7, 9, <Letter>{}),
        new GameboardCoordinate(9, 9, <Letter>{}),
        new GameboardCoordinate(13, 9, <Letter>{}),
        new GameboardCoordinate(1, 12, <Letter>{}),
        new GameboardCoordinate(8, 12, <Letter>{}),
        new GameboardCoordinate(15, 12, <Letter>{}),
        new GameboardCoordinate(7, 13, <Letter>{}),
        new GameboardCoordinate(9, 13, <Letter>{}),
        new GameboardCoordinate(4, 15, <Letter>{}),
        new GameboardCoordinate(12, 15, <Letter>{}),
    ];

    letterMultipliersByThree: GameboardCoordinate[] = [
        new GameboardCoordinate(6, 2, <Letter>{}),
        new GameboardCoordinate(10, 2, <Letter>{}),
        new GameboardCoordinate(11, 6, <Letter>{}),
        new GameboardCoordinate(6, 6, <Letter>{}),
        new GameboardCoordinate(10, 6, <Letter>{}),
        new GameboardCoordinate(14, 6, <Letter>{}),
        new GameboardCoordinate(2, 10, <Letter>{}),
        new GameboardCoordinate(6, 10, <Letter>{}),
        new GameboardCoordinate(10, 10, <Letter>{}),
        new GameboardCoordinate(14, 10, <Letter>{}),
        new GameboardCoordinate(6, 14, <Letter>{}),
        new GameboardCoordinate(10, 14, <Letter>{}),
    ];

    wordMultipliersByTwo: GameboardCoordinate[] = [
        new GameboardCoordinate(2, 2, <Letter>{}),
        new GameboardCoordinate(3, 3, <Letter>{}),
        new GameboardCoordinate(4, 4, <Letter>{}),
        new GameboardCoordinate(5, 4, <Letter>{}),
        new GameboardCoordinate(11, 5, <Letter>{}),
        new GameboardCoordinate(12, 4, <Letter>{}),
        new GameboardCoordinate(13, 3, <Letter>{}),
        new GameboardCoordinate(14, 2, <Letter>{}),
        new GameboardCoordinate(2, 14, <Letter>{}),
        new GameboardCoordinate(3, 15, <Letter>{}),
        new GameboardCoordinate(4, 12, <Letter>{}),
        new GameboardCoordinate(5, 11, <Letter>{}),
    ];

    wordMultipliersByThree: GameboardCoordinate[] = [
        new GameboardCoordinate(1, 1, <Letter>{}),
        new GameboardCoordinate(8, 1, <Letter>{}),
        new GameboardCoordinate(15, 1, <Letter>{}),
        new GameboardCoordinate(1, 8, <Letter>{}),
        new GameboardCoordinate(8, 8, <Letter>{}),
        new GameboardCoordinate(15, 8, <Letter>{}),
        new GameboardCoordinate(1, 15, <Letter>{}),
        new GameboardCoordinate(8, 15, <Letter>{}),
        new GameboardCoordinate(15, 15, <Letter>{}),
    ];

    applyBoxMultipliers(gameboard: Gameboard) {
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
