/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Gameboard } from '@app/classes/gameboard.class';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const letterMultipliersByTwo: LetterTile[] = [
    new LetterTile(4, 1, <Letter>{}),
    new LetterTile(12, 1, <Letter>{}),
    new LetterTile(7, 3, <Letter>{}),
    new LetterTile(9, 3, <Letter>{}),
    new LetterTile(1, 4, <Letter>{}),
    new LetterTile(8, 4, <Letter>{}),
    new LetterTile(15, 4, <Letter>{}),
    new LetterTile(3, 7, <Letter>{}),
    new LetterTile(7, 7, <Letter>{}),
    new LetterTile(9, 7, <Letter>{}),
    new LetterTile(13, 7, <Letter>{}),
    new LetterTile(4, 8, <Letter>{}),
    new LetterTile(12, 8, <Letter>{}),
    new LetterTile(3, 9, <Letter>{}),
    new LetterTile(7, 9, <Letter>{}),
    new LetterTile(9, 9, <Letter>{}),
    new LetterTile(13, 9, <Letter>{}),
    new LetterTile(1, 12, <Letter>{}),
    new LetterTile(8, 12, <Letter>{}),
    new LetterTile(15, 12, <Letter>{}),
    new LetterTile(7, 13, <Letter>{}),
    new LetterTile(9, 13, <Letter>{}),
    new LetterTile(4, 15, <Letter>{}),
    new LetterTile(12, 15, <Letter>{}),
];

const letterMultipliersByThree: LetterTile[] = [
    new LetterTile(6, 2, <Letter>{}),
    new LetterTile(10, 2, <Letter>{}),
    new LetterTile(11, 6, <Letter>{}),
    new LetterTile(6, 6, <Letter>{}),
    new LetterTile(10, 6, <Letter>{}),
    new LetterTile(14, 6, <Letter>{}),
    new LetterTile(2, 10, <Letter>{}),
    new LetterTile(6, 10, <Letter>{}),
    new LetterTile(10, 10, <Letter>{}),
    new LetterTile(14, 10, <Letter>{}),
    new LetterTile(6, 14, <Letter>{}),
    new LetterTile(10, 14, <Letter>{}),
];

const wordMultipliersByTwo: LetterTile[] = [
    new LetterTile(2, 2, <Letter>{}),
    new LetterTile(3, 3, <Letter>{}),
    new LetterTile(4, 4, <Letter>{}),
    new LetterTile(5, 4, <Letter>{}),
    new LetterTile(11, 5, <Letter>{}),
    new LetterTile(12, 4, <Letter>{}),
    new LetterTile(13, 3, <Letter>{}),
    new LetterTile(14, 2, <Letter>{}),
    new LetterTile(2, 14, <Letter>{}),
    new LetterTile(3, 15, <Letter>{}),
    new LetterTile(4, 12, <Letter>{}),
    new LetterTile(5, 11, <Letter>{}),
];

const wordMultipliersByThree: LetterTile[] = [
    new LetterTile(1, 1, <Letter>{}),
    new LetterTile(8, 1, <Letter>{}),
    new LetterTile(15, 1, <Letter>{}),
    new LetterTile(1, 8, <Letter>{}),
    new LetterTile(8, 8, <Letter>{}),
    new LetterTile(15, 8, <Letter>{}),
    new LetterTile(1, 15, <Letter>{}),
    new LetterTile(8, 15, <Letter>{}),
    new LetterTile(15, 15, <Letter>{}),
];

@Service()
export class BoxMultiplierService {
    applyBoxMultipliers(gameboard: Gameboard) {
        letterMultipliersByTwo.forEach((multiplyLetterByTwoPosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyLetterByTwoPosition);
            gameboardCoord.letterMultiplier = 2;
        });

        letterMultipliersByThree.forEach((multiplyLetterByThreePosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyLetterByThreePosition);
            gameboardCoord.letterMultiplier = 3;
        });

        wordMultipliersByTwo.forEach((multiplyWordByTwoPosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyWordByTwoPosition);
            gameboardCoord.wordMultiplier = 2;
        });

        wordMultipliersByThree.forEach((multiplyWordByThreePosition) => {
            const gameboardCoord = gameboard.getCoord(multiplyWordByThreePosition);
            gameboardCoord.wordMultiplier = 3;
        });
    }
}
