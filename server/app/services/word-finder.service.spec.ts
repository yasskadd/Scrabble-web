/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { Container } from 'typedi';
import { BoxMultiplierService } from './box-multiplier.service';
import { WordFinderService } from './word-finder.service';

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
        expect(word.isHorizontal).to.equal(true);
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
        expect(word.isHorizontal).to.equal(false);
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
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, new LetterTile(1, 1, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterC)];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 13, letterA));
            gameboard.placeLetter(new LetterTile(1, 14, letterB));
            gameboard.placeLetter(new LetterTile(1, 15, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 13, letterA), new LetterTile(1, 14, letterB), new LetterTile(1, 15, letterC)];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 2, letterA));
            gameboard.placeLetter(new LetterTile(1, 3, letterB));
            gameboard.placeLetter(new LetterTile(1, 4, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 2, letterA), new LetterTile(1, 3, letterB), new LetterTile(1, 4, letterC)];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    context('buildHorizontalWord tests', () => {
        it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(1, 2, letterB));
            gameboard.placeLetter(new LetterTile(1, 3, letterC));
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new LetterTile(1, 1, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, letterA));
            gameboard.placeLetter(new LetterTile(2, 1, letterB));
            gameboard.placeLetter(new LetterTile(3, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(13, 1, letterA));
            gameboard.placeLetter(new LetterTile(14, 1, letterB));
            gameboard.placeLetter(new LetterTile(15, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(13, 1, letterA), new LetterTile(14, 1, letterB), new LetterTile(15, 1, letterC)];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new LetterTile(2, 1, letterA));
            gameboard.placeLetter(new LetterTile(3, 1, letterB));
            gameboard.placeLetter(new LetterTile(4, 1, letterC));
            const placedLetters: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
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
        expect(words[0].isHorizontal).to.equal(true);
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: LetterTile[] = [new LetterTile(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new LetterTile(1, 2, letterB));
        gameboard.placeLetter(new LetterTile(1, 3, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.equal(false);
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
