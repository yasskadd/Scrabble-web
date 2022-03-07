/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LetterTile } from '@app/classes/letter-tile.class';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('LetterTile', () => {
    let letterTile: LetterTile;

    beforeEach(async () => {
        letterTile = new LetterTile({ x: 1, y: 1 });
    });

    it('should correctly set class attributes when constructor is called', () => {
        expect(letterTile.coordinate).to.eql({ x: 1, y: 1 });
        expect(letterTile.multiplier.number).to.equal(1);
        expect(letterTile.multiplier.type).to.equal('');
        expect(letterTile.isOccupied).to.equal(false);
        expect(letterTile.getLetter()).to.eql('');
    });

    it('setLetter() should correctly set letter string', () => {
        letterTile.setLetter('a');
        expect(letterTile.getLetter()).to.eql('a');
    });

    it('setLetter() should call setPoints()', () => {
        const setPointsSpy = sinon.spy(letterTile.setLetter, 'setPoints' as never);
        letterTile.setLetter('a');
        expect(setPointsSpy.called).to.have.true;
    });

    it('setPoints() should correctly set points if letter is an empty string', () => {
        letterTile.setLetter('');
        expect(letterTile.points).to.eql(0);
    });

    it('setPoints() should correctly set points if letter is given', () => {
        letterTile.setLetter('a');
        expect(letterTile.points).to.eql(1);
    });

    it('setPoints() should correctly set points if letter is given', () => {
        letterTile.setLetter('z');
        expect(letterTile.points).to.eql(10);
    });
});
