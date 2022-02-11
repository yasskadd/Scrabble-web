// TODO : TESTS

import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import { BoxMultiplier } from './box-multiplier.service';
// import { Service } from 'typedi';

describe('BoxMultiplier', () => {
    let boxMultiplierService: BoxMultiplier;
    let letterMultiplier2: GameboardCoordinate[];
    let letterMultiplier3: GameboardCoordinate[];
    let wordMultiplier2: GameboardCoordinate[];
    // let wordMultiplier3: GameboardCoordinate[];

    beforeEach(async () => {
        letterMultiplier2 = boxMultiplierService.letterMultipliersByTwo;
        letterMultiplier3 = boxMultiplierService.letterMultipliersByThree;
        wordMultiplier2 = boxMultiplierService.wordMultipliersByTwo;
        // wordMultiplier3 = boxMultiplierService.wordMultipliersByThree;
    });

    it(' {12, 6} board coordinate should belong in letterMultipliersByTwo', () => {
        const testCoordinate = new GameboardCoordinate(12, 6, {} as Letter);
        expect(letterMultiplier2).to.include(testCoordinate);
    });

    it(' {5, 9} board coordinate should belong in letterMultipliersByThree', () => {
        const testCoordinate = new GameboardCoordinate(5, 9, {} as Letter);
        expect(letterMultiplier3).to.include(testCoordinate);
    });

    it(' {10, 4} board coordinate should belong in wordMultipliersByTwo', () => {
        const testCoordinate = new GameboardCoordinate(10, 4, {} as Letter);
        expect(wordMultiplier2).to.include(testCoordinate);
    });

    // it(' {0, 0} board coordinate should belong in wordMultipliersByThree', () => {
    //     const testCoordinate = new GameboardCoordinate(0, 0, [] Letter[]);
    //     expect(wordMultiplier3).to.include(testCoordinate);
    // });
});
