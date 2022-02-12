/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Gameboard } from '@app/classes/gameboard.class';
import * as multipliers from '@common/board-multiplier-coords';
import { Service } from 'typedi';

@Service()
export class BoxMultiplierService {
    applyBoxMultipliers(gameboard: Gameboard) {
        multipliers.letterMultipliersByTwo.forEach((coord) => {
            const letter = gameboard.getLetterTile(coord);
            letter.multiplier = { type: 'LETTRE', number: 2 };
        });

        multipliers.letterMultipliersByThree.forEach((coord) => {
            const letter = gameboard.getLetterTile(coord);
            letter.multiplier = { type: 'LETTRE', number: 3 };
        });

        multipliers.wordMultipliersByTwo.forEach((coord) => {
            const letter = gameboard.getLetterTile(coord);
            letter.multiplier = { type: 'MOT', number: 2 };
        });

        multipliers.wordMultipliersByThree.forEach((coord) => {
            const letter = gameboard.getLetterTile(coord);
            letter.multiplier = { type: 'MOT', number: 3 };
        });
    }
}
