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
    const letterA: Letter = {} as Letter;
    const letterB: Letter = {} as Letter;
    const letterC: Letter = {} as Letter;

    beforeEach(() => {
        boxMultiplierService = Container.get(BoxMultiplierService);
        wordFinderService = Container.get(WordFinderService);
        gameboard = new Gameboard(boxMultiplierService);
        letterA.value = 'a';
        letterB.value = 'b';
        letterC.value = 'c';
    });

    it('buildFirstWord should build word with string abc if all placedLetters form abc', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 1, letterA),
            new GameboardCoordinate(2, 1, letterB),
            new GameboardCoordinate(2, 1, letterC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(2, 1, letterB), new GameboardCoordinate(3, 1, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(4, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(5, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(6, 1, letterC));
        gameboard.placeLetter(new GameboardCoordinate(7, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(2, 1, letterA),
            new GameboardCoordinate(4, 1, letterB),
            new GameboardCoordinate(6, 1, letterC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.true;
    });

    it('buildFirstWord should build string if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 3, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 4, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 5, letterC));
        gameboard.placeLetter(new GameboardCoordinate(1, 6, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 5, letterA),
            new GameboardCoordinate(1, 3, letterB),
            new GameboardCoordinate(1, 1, letterC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.false;
    });

    it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterC));
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, new GameboardCoordinate(1, 1, letterA));
        expect(word.stringFormat).to.eql('');
    });

    it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 3, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 1, letterA),
            new GameboardCoordinate(1, 2, letterB),
            new GameboardCoordinate(1, 3, letterC),
        ];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 13, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 14, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 15, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 13, letterA),
            new GameboardCoordinate(1, 14, letterB),
            new GameboardCoordinate(1, 15, letterC),
        ];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 3, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 4, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 2, letterA),
            new GameboardCoordinate(1, 3, letterB),
            new GameboardCoordinate(1, 4, letterC),
        ];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 3, letterC));
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
        expect(word.stringFormat).to.eql('');
    });

    it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 1, letterA),
            new GameboardCoordinate(2, 1, letterB),
            new GameboardCoordinate(3, 1, letterC),
        ];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(13, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(14, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(15, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(13, 1, letterA),
            new GameboardCoordinate(14, 1, letterB),
            new GameboardCoordinate(15, 1, letterC),
        ];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterA));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(4, 1, letterC));
        const placedLetters: GameboardCoordinate[] = [
            new GameboardCoordinate(2, 1, letterA),
            new GameboardCoordinate(3, 1, letterB),
            new GameboardCoordinate(4, 1, letterC),
        ];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        gameboard.placeLetter(new GameboardCoordinate(3, 1, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.true;
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterB));
        gameboard.placeLetter(new GameboardCoordinate(1, 3, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.false;
    });

    it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
        const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new GameboardCoordinate(1, 2, letterA));
        gameboard.placeLetter(new GameboardCoordinate(2, 1, letterB));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(2);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['aa', 'ab']);
    });
});
