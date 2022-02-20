/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';

// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

describe('Coordinate', () => {
    let coordinateClass: LetterTile;

    beforeEach(async () => {
        coordinateClass = new LetterTile(0, 0, {} as Letter);
    });

    it('should reset letterMultiplier to 1 if resetLetterMultiplier is called', () => {
        coordinateClass.letterMultiplier = 5;
        coordinateClass.resetLetterMultiplier();
        expect(coordinateClass.letterMultiplier).to.equal(1);
    });

    it('should reset wordMultiplier if resetWordMultiplier is called', () => {
        coordinateClass.wordMultiplier = 5;
        coordinateClass.resetWordMultiplier();
        expect(coordinateClass.wordMultiplier).to.equal(1);
    });

    it('should correctly set class attributes when constructor is called', () => {
        expect(coordinateClass.x && coordinateClass.y).to.equal(0);
        expect(coordinateClass.letterMultiplier && coordinateClass.wordMultiplier).to.equal(1);
        expect(coordinateClass.isOccupied).to.equal(false);
        expect(coordinateClass.letter).to.eql({} as Letter);
    });

    it('findDirection should return Horizontal if all the coordinates are in the same line', () => {
        const coordList: LetterTile[] = [new LetterTile(0, 0, {} as Letter), new LetterTile(7, 0, {} as Letter), new LetterTile(9, 0, {} as Letter)];
        const direction: boolean | null = LetterTile.findDirection(coordList);
        expect(direction).to.eql('Horizontal');
    });

    it('findDirection should return Vertical if all the coordinates are in the same column', () => {
        const coordList: LetterTile[] = [new LetterTile(0, 0, {} as Letter), new LetterTile(0, 7, {} as Letter), new LetterTile(0, 9, {} as Letter)];
        const direction: boolean | null = LetterTile.findDirection(coordList);
        expect(direction).to.eql('Vertical');
    });

    it('findDirection should return None if all the coordinates not in the same line or column', () => {
        const coordList: LetterTile[] = [new LetterTile(0, 3, {} as Letter), new LetterTile(2, 8, {} as Letter), new LetterTile(5, 6, {} as Letter)];
        const direction: boolean | null = LetterTile.findDirection(coordList);
        expect(direction).to.eql('None');
    });
});
