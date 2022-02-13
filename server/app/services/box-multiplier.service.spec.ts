// TODO : TESTS
import * as multipliers from '@common/board-multiplier-coords';
import { expect } from 'chai';
// import { Service } from 'typedi';

describe('BoxMultiplier', () => {
    // let boxMultiplierService: BoxMultiplierService;

    beforeEach(async () => {});

    it(' {12, 6} board coordinate should belong in letterMultipliersByTwo', () => {
        const testCoordinate = { x: 12, y: 6 };
        expect(multipliers.letterMultipliersByTwo).to.include(testCoordinate);
    });

    it(' {5, 9} board coordinate should belong in letterMultipliersByThree', () => {
        const testCoordinate = { x: 5, y: 9 };
        expect(multipliers.letterMultipliersByThree).to.include(testCoordinate);
    });

    it(' {10, 4} board coordinate should belong in wordMultipliersByTwo', () => {
        const testCoordinate = { x: 10, y: 4 };
        expect(multipliers.wordMultipliersByTwo).to.include(testCoordinate);
    });

    it(' {0, 0} board coordinate should belong in wordMultipliersByThree', () => {
        const testCoordinate = { x: 0, y: 0 };
        expect(multipliers.wordMultipliersByThree).to.include(testCoordinate);
    });

    it(' ');
});
