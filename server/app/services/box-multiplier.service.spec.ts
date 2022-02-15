// TODO : TESTS

import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import { BoxMultiplierService } from './box-multiplier.service';

describe('BoxMultiplier', () => {
    let boxMultiplierService: BoxMultiplierService;
    let letterMultiplier2: LetterTile[];
    let letterMultiplier3: LetterTile[];
    let wordMultiplier2: LetterTile[];
    // let wordMultiplier3: LetterTile[];

    beforeEach(async () => {
        letterMultiplier2 = boxMultiplierService.letterMultipliersByTwo;
        letterMultiplier3 = boxMultiplierService.letterMultipliersByThree;
        wordMultiplier2 = boxMultiplierService.wordMultipliersByTwo;
        // wordMultiplier3 = boxMultiplierService.wordMultipliersByThree;
    });

    it(' {12, 6} board coordinate should belong in letterMultipliersByTwo', () => {
        const testCoordinate = new LetterTile(12, 6, {} as Letter);
        expect(letterMultiplier2).to.include(testCoordinate);
    });

    it(' {5, 9} board coordinate should belong in letterMultipliersByThree', () => {
        const testCoordinate = new LetterTile(5, 9, {} as Letter);
        expect(letterMultiplier3).to.include(testCoordinate);
    });

    it(' {10, 4} board coordinate should belong in wordMultipliersByTwo', () => {
        const testCoordinate = new LetterTile(10, 4, {} as Letter);
        expect(wordMultiplier2).to.include(testCoordinate);
    });

    // it(' {0, 0} board coordinate should belong in wordMultipliersByThree', () => {
    //     const testCoordinate = new LetterTile(0, 0, [] Letter[]);
    //     expect(wordMultiplier3).to.include(testCoordinate);
    // });
});
