/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';
import Sinon = require('sinon');
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

// TODO : the rest of the tests
describe('Word', () => {
    let gameboard: Gameboard;
    let word: Word;
    let letterA: Letter;
    let letterB: Letter;
    let letterC: Letter;
    let letterD: Letter;

    beforeEach(async () => {
        letterA = { value: 'a', points: 1, quantity: 1 };
        letterB = { value: 'b', points: 2, quantity: 1 };
        letterC = { value: 'c', points: 5, quantity: 1 };
        letterD = { value: 'd', points: 4, quantity: 1 };
        gameboard = new Gameboard();
    });

    it('buildWord should build word with string abc if all placedLetters form abc', () => {
        gameboard.placeLetter({ x: 1, y: 1 }, letterA.value);
        gameboard.placeLetter({ x: 2, y: 1 }, letterB.value);
        gameboard.placeLetter({ x: 3, y: 1 }, letterC.value);
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(2, 1, letterC)];
        word = Word['buildWord'](placedLetters, gameboard);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildWord should build string abc if only a,b are the placedLetters', () => {
        gameboard.placeLetter(new LetterTile(1, 1, letterA));
        gameboard.placeLetter(new LetterTile(2, 1, letterB));
        gameboard.placeLetter(new LetterTile(3, 1, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        word = Word['buildWord'](placedLetters, gameboard);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new LetterTile(2, 1, letterA));
        gameboard.placeLetter(new LetterTile(3, 1, letterA));
        gameboard.placeLetter(new LetterTile(4, 1, letterB));
        gameboard.placeLetter(new LetterTile(5, 1, letterB));
        gameboard.placeLetter(new LetterTile(6, 1, letterC));
        gameboard.placeLetter(new LetterTile(7, 1, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(4, 1, letterB), new LetterTile(6, 1, letterC)];
        word = Word['buildWord'](placedLetters, gameboard);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.true;
    });

    it('buildWord should build string if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new LetterTile(1, 1, letterA));
        gameboard.placeLetter(new LetterTile(1, 2, letterA));
        gameboard.placeLetter(new LetterTile(1, 3, letterB));
        gameboard.placeLetter(new LetterTile(1, 4, letterB));
        gameboard.placeLetter(new LetterTile(1, 5, letterC));
        gameboard.placeLetter(new LetterTile(1, 6, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(1, 5, letterA), new LetterTile(1, 3, letterB), new LetterTile(1, 1, letterC)];
        word = Word['buildWord'](placedLetters, gameboard);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.false;
    });

    it('buildWord should return empty word if coordList is empty', () => {
        word = Word['buildWord']([], gameboard);
        expect(word).to.eql({} as Word);
    });

    context('buildWord() Vertical tests', () => {
        it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(2, 1, letterB));
            gameboard.placeLetter(new LetterTile(3, 1, letterC));
            word = Word['buildWord'](false, new LetterTile(1, 1, letterA), gameboard);
            expect(word.stringFormat).to.eql('');
        });

        it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterC)];
            word = Word['buildWord'](false, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 13, letterA));
            gameboard.placeLetter(new LetterTile(1, 14, letterB));
            gameboard.placeLetter(new LetterTile(1, 15, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 13, letterA), new LetterTile(1, 14, letterB), new LetterTile(1, 15, letterC)];
            word = Word['buildWord'](false, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 2, letterA));
            gameboard.placeLetter(new LetterTile(1, 3, letterB));
            gameboard.placeLetter(new LetterTile(1, 4, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 2, letterA), new LetterTile(1, 3, letterB), new LetterTile(1, 4, letterC)];
            word = Word['buildWord'](false, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    context('buildWord() Horizontal tests', () => {
        it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            word = Word['buildWord'](true, new LetterTile(1, 1, letterA), gameboard);
            expect(word.stringFormat).to.eql('');
        });

        it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(2, 1, letterB));
            gameboard.placeLetter(new LetterTile(3, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
            word = Word['buildWord'](true, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(13, 1, letterA));
            gameboard.placeLetter(new LetterTile(14, 1, letterB));
            gameboard.placeLetter(new LetterTile(15, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(13, 1, letterA), new LetterTile(14, 1, letterB), new LetterTile(15, 1, letterC)];
            word = Word['buildWord'](true, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(2, 1, letterA));
            gameboard.placeLetter(new LetterTile(3, 1, letterB));
            gameboard.placeLetter(new LetterTile(4, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
            word = Word['buildWord'](true, placedLetters[1], gameboard);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    it('stringFormat attribute should be the abc if constructed word is horizontal', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 1 }, letters: ['a', 'b', 'c'] }, gameboard);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.be.true;
    });

    it('stringFormat attribute should be the abcd if constructed word is vertical', () => {
        word = new Word({ isHorizontal: false, firstCoordinate: { x: 3, y: 3 }, letters: ['a', 'b', 'c', 'd'] }, gameboard);
        expect(word.stringFormat).to.eql('abcd');
        expect(word.isHorizontal).to.be.false;
    });

    it('should correctly calculate points if there is no multiplier', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 5 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = letterA.points + letterB.points + letterC.points;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if there is a letterMultiplier', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 2, y: 1 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is vertical and on letterMultiplier', () => {
        word = new Word({ isHorizontal: false, firstCoordinate: { x: 7, y: 1 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 1 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier and is vertical', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 1 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a Letter and a word multiplier', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 8 }, letters: ['a', 'b', 'c', 'd'] }, gameboard);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points + letterD.points * 2) * 3;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on two Letter multipliers', () => {
        word = new Word({ isHorizontal: true, firstCoordinate: { x: 7, y: 7 }, letters: ['a', 'b', 'c'] }, gameboard);
        const expectedScore: number = letterA.points * 2 + letterB.points + letterC.points * 2;
        expect(word.calculateWordPoints(word, gameboard)).to.equal(expectedScore);
    });

    it('findAdjacentWords should return a single word if there is one placedLetter and letters are horizontal', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter({ x: 1, y: 1 }, letterA.value);
        gameboard.placeLetter({ x: 2, y: 1 }, letterB.value);
        gameboard.placeLetter({ x: 3, y: 1 }, letterC.value);
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.true;
    });

    it('findAdjacentWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter({ x: 1, y: 1 }, letterA.value);
        gameboard.placeLetter({ x: 1, y: 2 }, letterB.value);
        gameboard.placeLetter({ x: 1, y: 3 }, letterC.value);
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.false;
    });

    it('findAdjacentWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter({ x: 1, y: 1 }, letterA.value);
        gameboard.placeLetter({ x: 1, y: 2 }, letterA.value);
        gameboard.placeLetter({ x: 2, y: 1 }, letterB.value);
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetter);
        expect(words).to.have.lengthOf(2);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['aa', 'ab']);
    });

    it('findAdjacentWords() should return an array of 2 words if there is 2 horizontal placed Letters related to 2 words', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new LetterTile(1, 2, { value: 'c' } as Letter));
        gameboard.placeLetter(new LetterTile(2, 2, { value: 'b' } as Letter));
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'ac', 'bb']);
    });

    it('findAdjacentWords() should return an array of 2 words if there is 2 vertical placed Letters related to 2 words', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new LetterTile(2, 1, letterA));
        gameboard.placeLetter(new LetterTile(2, 2, letterA));
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'aa', 'ba']);
    });

    it('should return word array with only one word if letterCoords are vertical and there is no adjacent placed letters', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(words.length).to.equal(1);
        expect(stringList).to.eql(['ab']);
    });

    it('should return word array with only one word if letterCoords are horizontal and there is no adjacent placed letters', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        const words: Word[] = Word['findAdjacentWords'](gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(words.length).to.equal(1);
        expect(stringList).to.eql(['ab']);
    });

    it('findAdjacentWords() should return empty array if coordList is empty', () => {
        expect(Word.findAdjacentWords(gameboard, [])).to.eql([]);
    });
});
