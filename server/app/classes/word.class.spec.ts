/* eslint-disable prettier/prettier */
import { expect } from 'chai';
import { Coordinate } from './coordinate.class';
import { Letter } from './letter.class';
import { Word } from './word.class';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

describe('Coordinate', () => {
    let word: Word;
    const letterA = new Letter();
    const letterB = new Letter();
    const letterC = new Letter();

    beforeEach(async () => {
        letterA.stringChar = 'a';
        letterB.stringChar = 'b';
        letterC.stringChar = 'c';
    });

    it('stringFormat attribute should be the abc', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        word = new Word(true, coordList);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.be.true;
    });
});
