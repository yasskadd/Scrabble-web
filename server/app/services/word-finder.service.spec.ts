/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Letter } from '@common/letter';
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
        gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
        gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(1, 0, letterB),
            new GameboardCoordinate(1, 0, letterC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
        gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
        const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(1, 0, letterB), new GameboardCoordinate(2, 0, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string aabbcc if there is already occupied squares between horizontal placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(3, 0, letterB));
        gameboard.placeLetter(new GameboardCoordinate(4, 0, letterB));
        gameboard.placeLetter(new GameboardCoordinate(5, 0, letterC));
        gameboard.placeLetter(new GameboardCoordinate(6, 0, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 0, letterA),
            new GameboardCoordinate(3, 0, letterB),
            new GameboardCoordinate(5, 0, letterC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.true;
    });

    it('buildFirstWord should build string if there is already occupied squares between vertical placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
        gameboard.placeLetter(new GameboardCoordinate(0, 3, letterB));
        gameboard.placeLetter(new GameboardCoordinate(0, 4, letterC));
        gameboard.placeLetter(new GameboardCoordinate(0, 5, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 4, letterA),
            new GameboardCoordinate(0, 2, letterB),
            new GameboardCoordinate(0, 0, letterC),
        ];
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
            gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
            gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
            gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 0, letterA),
                new GameboardCoordinate(0, 1, letterB),
                new GameboardCoordinate(0, 2, letterC),
            ];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(0, 12, letterA));
            gameboard.placeLetter(new GameboardCoordinate(0, 13, letterB));
            gameboard.placeLetter(new GameboardCoordinate(0, 14, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 12, letterA),
                new GameboardCoordinate(0, 13, letterB),
                new GameboardCoordinate(0, 14, letterC),
            ];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
            gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
            gameboard.placeLetter(new GameboardCoordinate(0, 3, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 1, letterA),
                new GameboardCoordinate(0, 2, letterB),
                new GameboardCoordinate(0, 3, letterC),
            ];
            const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    context('buildHorizontalWord tests', () => {
        it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
            gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
            gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
            expect(word.stringFormat).to.eql('');
        });

        it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
            gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 0, letterA),
                new GameboardCoordinate(1, 0, letterB),
                new GameboardCoordinate(2, 0, letterC),
            ];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(12, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(13, 0, letterB));
            gameboard.placeLetter(new GameboardCoordinate(14, 0, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(12, 0, letterA),
                new GameboardCoordinate(13, 0, letterB),
                new GameboardCoordinate(14, 0, letterC),
            ];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });

        it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
            gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
            gameboard.placeLetter(new GameboardCoordinate(2, 0, letterB));
            gameboard.placeLetter(new GameboardCoordinate(3, 0, letterC));
            const placedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(1, 0, letterA),
                new GameboardCoordinate(2, 0, letterB),
                new GameboardCoordinate(3, 0, letterC),
            ];
            const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
            expect(word.stringFormat).to.eql('abc');
        });
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
        gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.true;
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.false;
    });

    it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(2);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['aa', 'ab']);
    });

    it('findNewWords() should return an array of 2 words if there is 2 horizontal placed Letters related to 2 words', () => {
        const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA), new GameboardCoordinate(1, 0, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new GameboardCoordinate(0, 1, { value: 'c' } as Letter));
        gameboard.placeLetter(new GameboardCoordinate(1, 1, { value: 'b' } as Letter));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'ac', 'bb']);
    });

    it('findNewWords() should return an array of 2 words if there is 2 vertical placed Letters related to 2 words', () => {
        const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA), new GameboardCoordinate(0, 1, letterB)];
        gameboard.placeLetter(placedLetters[0]);
        gameboard.placeLetter(placedLetters[1]);
        gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetters);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['ab', 'aa', 'ba']);
    });

    it('findNewWords() should return empty array if coordList is empty', () => {
        expect(wordFinderService.findNewWords(gameboard, [])).to.eql([]);
    });
});
