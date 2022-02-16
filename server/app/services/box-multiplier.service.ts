/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Gameboard } from '@app/classes/gameboard.class';
import * as multipliers from '@common/board-multiplier-coords';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';

const letterMultipliersByTwo: LetterTile[] = [];
multipliers.letterMultipliersByTwo.forEach((coord: Coordinate) => letterMultipliersByTwo.push(new LetterTile(coord.x, coord.y, {} as Letter)));

const letterMultipliersByThree: LetterTile[] = [];
multipliers.letterMultipliersByThree.forEach((coord: Coordinate) => letterMultipliersByThree.push(new LetterTile(coord.x, coord.y, {} as Letter)));

const wordMultipliersByTwo: LetterTile[] = [];
multipliers.wordMultipliersByTwo.forEach((coord: Coordinate) => wordMultipliersByTwo.push(new LetterTile(coord.x, coord.y, {} as Letter)));

const wordMultipliersByThree: LetterTile[] = [];
multipliers.wordMultipliersByThree.forEach((coord: Coordinate) => wordMultipliersByThree.push(new LetterTile(coord.x, coord.y, {} as Letter)));

const MIDDLE_COORD: Coordinate = { x: 8, y: 8 };
@Service()
export class BoxMultiplierService {
    applyBoxMultipliers(gameboard: Gameboard) {
        letterMultipliersByTwo.forEach((multiplyLetterByTwoPosition) => {
            gameboard.getCoord(multiplyLetterByTwoPosition).letterMultiplier = 2;
        });

        letterMultipliersByThree.forEach((multiplyLetterByThreePosition) => {
            gameboard.getCoord(multiplyLetterByThreePosition).letterMultiplier = 3;
        });

        wordMultipliersByTwo.forEach((multiplyWordByTwoPosition) => {
            gameboard.getCoord(multiplyWordByTwoPosition).wordMultiplier = 2;
        });

        wordMultipliersByThree.forEach((multiplyWordByThreePosition) => {
            gameboard.getCoord(multiplyWordByThreePosition).wordMultiplier = 3;
        });

        gameboard.getCoord(new LetterTile(MIDDLE_COORD.x, MIDDLE_COORD.y, {} as Letter)).wordMultiplier = 2;
    }
}
