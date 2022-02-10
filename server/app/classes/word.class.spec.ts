/* eslint-disable prettier/prettier */
import { Coordinate } from '@common/coordinate';
import { LetterTile } from '@common/LetterTile.class';
import { expect } from 'chai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

// TODO : the rest of the tests
describe('Coordinate', () => {
    let letter: LetterTile;

    beforeEach(async () => {
        const position: Coordinate = { x: 0, y: 0 };
        letter = new LetterTile(position, '');
    });

    it('should correctly set class attributes when constructor is called', () => {
        expect(letter.coordinate.x && letter.coordinate.y).to.equal(0);
        expect(letter.multiplier).to.equal(1);
        expect(letter.isOccupied).to.equal(false);
        expect(letter.value).to.eql({} as LetterTile);
    });
});
