/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

describe('Word', () => {
    let word: Word;
    const letterA = {} as Letter;
    const letterB = {} as Letter;
    const letterC = {} as Letter;
    const letterD = {} as Letter;
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;

    beforeEach(async () => {
        letterA.value = 'a';
        letterA.points = 1;
        letterB.value = 'b';
        letterB.points = 2;
        letterC.value = 'c';
        letterC.points = 5;
        letterD.value = 'd';
        letterD.points = 4;
        boxMultiplierService = Container.get(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('stringFormat attribute should be the abc if constructed word is horizontal', () => {
        const coordList: LetterTile[] = [new LetterTile(0, 0, letterA), new LetterTile(1, 0, letterB), new LetterTile(2, 0, letterC)];
        word = new Word(true, coordList);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.be.true;
    });

    it('stringFormat attribute should be the abcd if constructed word is vertical', () => {
        const coordList: LetterTile[] = [
            new LetterTile(3, 3, letterA),
            new LetterTile(3, 4, letterB),
            new LetterTile(3, 5, letterC),
            new LetterTile(3, 6, letterD),
        ];
        word = new Word(false, coordList);
        expect(word.stringFormat).to.eql('abcd');
        expect(word.isFirstWord).to.be.false;
    });

    it('should correctly calculate points if there is no multiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 5, letterA), new LetterTile(2, 5, letterB), new LetterTile(3, 5, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if there is a letterMultiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is vertical and on letterMultiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(7, 1, letterA), new LetterTile(7, 2, letterB), new LetterTile(7, 3, letterC)];
        word = new Word(false, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier and is vertical', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a Letter and a word multiplier', () => {
        // eslint-disable-next-line max-len
        const coordList: LetterTile[] = [
            new LetterTile(1, 8, letterA),
            new LetterTile(2, 8, letterB),
            new LetterTile(3, 8, letterC),
            new LetterTile(4, 8, letterD),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points + letterD.points * 2) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on two Letter multipliers', () => {
        const coordList: LetterTile[] = [new LetterTile(7, 7, letterA), new LetterTile(8, 7, letterB), new LetterTile(9, 7, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points * 2 + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should reset wordMultiplier in gameboard after calculating points', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new LetterTile(1, 1, letterA));
        expect(gameboardCoord.wordMultiplier).to.equal(1);
    });

    it('should reset Letter in gameboard after calculating points', () => {
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new LetterTile(4, 1, letterC));
        expect(gameboardCoord.letterMultiplier).to.equal(1);
    });

    it('resetLetterMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: LetterTile = new LetterTile(4, 1, letterC);
        const gameboardCoord: LetterTile = gameboard.getCoord(squareMultiplier3);
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), squareMultiplier3];
        const spyReset = Sinon.spy(gameboardCoord, 'resetLetterMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.calledOnce(spyReset);
    });

    it('resetWordMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: LetterTile = new LetterTile(1, 1, letterA);
        const gameboardCoord: LetterTile = gameboard.getCoord(squareMultiplier3);
        const coordList: LetterTile[] = [squareMultiplier3, new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        const spyReset = Sinon.spy(gameboardCoord, 'resetWordMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.called(spyReset);
    });
});

describe('WordFinderService', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;
    let wordFinderService: WordFinderService;
    let letterA: Letter;
    let letterB: Letter;
    let letterC: Letter;

    beforeEach(() => {
        boxMultiplierService = Container.get(BoxMultiplierService);
        wordFinderService = Container.get(WordFinderService);
        gameboard = new Gameboard(boxMultiplierService);
        letterA = { value: 'a' } as Letter;
        letterB = { value: 'b' } as Letter;
        letterC = { value: 'c' } as Letter;
    });

    it('buildFirstWord should build word with string abc if all placedLetters form abc', () => {
        gameboard.placeLetter(new LetterTile(1, 1, letterA));
        gameboard.placeLetter(new LetterTile(2, 1, letterB));
        gameboard.placeLetter(new LetterTile(3, 1, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(2, 1, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
        gameboard.placeLetter(new LetterTile(1, 1, letterA));
        gameboard.placeLetter(new LetterTile(2, 1, letterB));
        gameboard.placeLetter(new LetterTile(3, 1, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new LetterTile(2, 1, letterA));
        gameboard.placeLetter(new LetterTile(3, 1, letterA));
        gameboard.placeLetter(new LetterTile(4, 1, letterB));
        gameboard.placeLetter(new LetterTile(5, 1, letterB));
        gameboard.placeLetter(new LetterTile(6, 1, letterC));
        gameboard.placeLetter(new LetterTile(7, 1, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(4, 1, letterB), new LetterTile(6, 1, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.true;
    });

    it('buildFirstWord should build string if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new LetterTile(1, 1, letterA));
        gameboard.placeLetter(new LetterTile(1, 2, letterA));
        gameboard.placeLetter(new LetterTile(1, 3, letterB));
        gameboard.placeLetter(new LetterTile(1, 4, letterB));
        gameboard.placeLetter(new LetterTile(1, 5, letterC));
        gameboard.placeLetter(new LetterTile(1, 6, letterC));
        const placedLetters: LetterTile[] = [new LetterTile(1, 5, letterA), new LetterTile(1, 3, letterB), new LetterTile(1, 1, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.false;
    });

    it('buildFirstWord should return empty word if coordList is empty', () => {
        const word: Word = wordFinderService.buildFirstWord(gameboard, []);
        expect(word).to.eql({} as Word);
    });

    context('buildVerticalWord() tests', () => {
        it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(2, 1, letterB));
            gameboard.placeLetter(new LetterTile(3, 1, letterC));
            const word: Word = wordFinderService.buildVerticalWord(gameboard, new LetterTile(1, 1, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterC)];
            const word: Word = wordFinderService.buildVerticalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 13, letterA));
            gameboard.placeLetter(new LetterTile(1, 14, letterB));
            gameboard.placeLetter(new LetterTile(1, 15, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 13, letterA), new LetterTile(1, 14, letterB), new LetterTile(1, 15, letterC)];
            const word: Word = wordFinderService.buildVerticalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 2, letterA));
            gameboard.placeLetter(new LetterTile(1, 3, letterB));
            gameboard.placeLetter(new LetterTile(1, 4, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 2, letterA), new LetterTile(1, 3, letterB), new LetterTile(1, 4, letterC)];
            const word: Word = wordFinderService.buildVerticalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    context('buildHorizontalWord tests', () => {
        it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            const word: Word = wordFinderService.buildHorizontalWord(gameboard, new LetterTile(1, 1, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(2, 1, letterB));
            gameboard.placeLetter(new LetterTile(3, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
            const word: Word = wordFinderService.buildHorizontalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(13, 1, letterA));
            gameboard.placeLetter(new LetterTile(14, 1, letterB));
            gameboard.placeLetter(new LetterTile(15, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(13, 1, letterA), new LetterTile(14, 1, letterB), new LetterTile(15, 1, letterC)];
            const word: Word = wordFinderService.buildHorizontalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(2, 1, letterA));
            gameboard.placeLetter(new LetterTile(3, 1, letterB));
            gameboard.placeLetter(new LetterTile(4, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
            const word: Word = wordFinderService.buildHorizontalWord(gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new LetterTile(2, 1, letterB));
        gameboard.placeLetter(new LetterTile(3, 1, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.true;
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new LetterTile(1, 2, letterB));
        gameboard.placeLetter(new LetterTile(1, 3, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.false;
    });

    it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new LetterTile(1, 2, letterA));
        gameboard.placeLetter(new LetterTile(2, 1, letterB));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(2);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['aa', 'ab']);
    });

    it('findNewWords() should return an array of 2 words if there is 2 horizontal placed Letters related to 2 words', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new LetterTile(1, 2, { value: 'c' } as Letter));
        gameboard.placeLetter(new LetterTile(2, 2, { value: 'b' } as Letter));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'ac', 'bb']);
    });

    it('findNewWords() should return an array of 2 words if there is 2 vertical placed Letters related to 2 words', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new LetterTile(2, 1, letterA));
        gameboard.placeLetter(new LetterTile(2, 2, letterA));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'aa', 'ba']);
    });

    it('should return word array with only one word if letterCoords are vertical and there is no adjacent placed letters', () => {
        const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
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
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(words.length).to.equal(1);
        expect(stringList).to.eql(['ab']);
    });

    it('findNewWords() should return empty array if coordList is empty', () => {
        expect(wordFinderService.findNewWords(gameboard, [])).to.eql([]);
    });
});
