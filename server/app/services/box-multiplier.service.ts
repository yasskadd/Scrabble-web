/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Gameboard } from '@app/classes/gameboard.class';
import * as multipliers from '@common/board-multiplier-coords';
import { Service } from 'typedi';

const MIDDLE_COORD = { x: 8, y: 8 };

@Service()
export class BoxMultiplierService {
    applyBoxMultipliers(gameboard: Gameboard) {
        multipliers.letterMultipliersByTwo.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'LETTRE', number: 2 };
        });

        multipliers.letterMultipliersByThree.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'LETTRE', number: 3 };
        });

        multipliers.wordMultipliersByTwo.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'MOT', number: 2 };
        });

        multipliers.wordMultipliersByThree.forEach((coord) => {
            gameboard.getLetterTile(coord).multiplier = { type: 'MOT', number: 3 };
        });

        gameboard.getLetterTile(MIDDLE_COORD).multiplier = { type: 'MOT', number: 2 };
    }
}
