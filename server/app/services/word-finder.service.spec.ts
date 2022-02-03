/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */
import { Coordinate } from '@app/classes/coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Letter } from '@app/letter';
import { expect } from 'chai';
import { Container } from 'typedi';
import { BoxMultiplier } from './box-multiplier.service';
import { WordFinderService } from './word-finder.service';

describe('WordFinderService', () => {
    let gameboard: GameBoard;
    let boxMultiplierService: BoxMultiplier;
    let wordFinderService: WordFinderService;
    const letterA: Letter = new Letter();
    const letterB: Letter = new Letter();
    const letterC: Letter = new Letter();

    beforeEach(() => {
        boxMultiplierService = Container.get(BoxMultiplier);
        wordFinderService = Container.get(WordFinderService);
        gameboard = new GameBoard(boxMultiplierService);
        letterA.stringChar = 'a';
        letterB.stringChar = 'b';
        letterC.stringChar = 'c';
    });

    it('buildFirstWord should build word with string abc if all placedLetters form abc', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        gameboard.placeLetter(new Coordinate(2, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(1, 0, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        gameboard.placeLetter(new Coordinate(2, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildFirstWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new Coordinate(1, 0, letterA));
        gameboard.placeLetter(new Coordinate(2, 0, letterA));
        gameboard.placeLetter(new Coordinate(3, 0, letterB));
        gameboard.placeLetter(new Coordinate(4, 0, letterB));
        gameboard.placeLetter(new Coordinate(5, 0, letterC));
        gameboard.placeLetter(new Coordinate(6, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(1, 0, letterA), new Coordinate(3, 0, letterB), new Coordinate(5, 0, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('aabbcc');
        expect(word.isHorizontal).to.be.true;
    });

    it('buildFirstWord should build string if there is already occupied squares between placedLetters', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(0, 1, letterA));
        gameboard.placeLetter(new Coordinate(0, 2, letterB));
        gameboard.placeLetter(new Coordinate(0, 3, letterB));
        gameboard.placeLetter(new Coordinate(0, 4, letterC));
        gameboard.placeLetter(new Coordinate(0, 5, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 4, letterA), new Coordinate(0, 2, letterB), new Coordinate(0, 0, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('ccbbaa');
        expect(word.isHorizontal).to.be.false;
    });

    it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        gameboard.placeLetter(new Coordinate(2, 0, letterC));
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, new Coordinate(0, 0, letterA));
        expect(word.stringFormat).to.eql('');
    });

    it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(0, 1, letterB));
        gameboard.placeLetter(new Coordinate(0, 2, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(0, 1, letterB), new Coordinate(0, 2, letterC)];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('cba');
    });

    it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(0, 12, letterA));
        gameboard.placeLetter(new Coordinate(0, 13, letterB));
        gameboard.placeLetter(new Coordinate(0, 14, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 12, letterA), new Coordinate(0, 13, letterB), new Coordinate(0, 14, letterC)];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('cba');
    });

    it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(0, 1, letterA));
        gameboard.placeLetter(new Coordinate(0, 2, letterB));
        gameboard.placeLetter(new Coordinate(0, 3, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 1, letterA), new Coordinate(0, 2, letterB), new Coordinate(0, 3, letterC)];
        const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('cba');
    });

    it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(0, 1, letterB));
        gameboard.placeLetter(new Coordinate(0, 2, letterC));
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new Coordinate(0, 0, letterA));
        expect(word.stringFormat).to.eql('');
    });

    it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        gameboard.placeLetter(new Coordinate(2, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(12, 0, letterA));
        gameboard.placeLetter(new Coordinate(13, 0, letterB));
        gameboard.placeLetter(new Coordinate(14, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(12, 0, letterA), new Coordinate(13, 0, letterB), new Coordinate(14, 0, letterC)];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
        gameboard.placeLetter(new Coordinate(1, 0, letterA));
        gameboard.placeLetter(new Coordinate(2, 0, letterB));
        gameboard.placeLetter(new Coordinate(3, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(1, 0, letterA), new Coordinate(2, 0, letterB), new Coordinate(3, 0, letterC)];
        const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
        expect(word.stringFormat).to.eql('abc');
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
        const placedLetter: Coordinate[] = [new Coordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        gameboard.placeLetter(new Coordinate(2, 0, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('abc');
        expect(words[0].isHorizontal).to.be.true;
    });

    it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
        const placedLetter: Coordinate[] = [new Coordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new Coordinate(0, 1, letterB));
        gameboard.placeLetter(new Coordinate(0, 2, letterC));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(1);
        expect(words[0].stringFormat).to.eql('cba');
        expect(words[0].isHorizontal).to.be.false;
    });

    it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
        const placedLetter: Coordinate[] = [new Coordinate(0, 0, letterA)];
        gameboard.placeLetter(placedLetter[0]);
        gameboard.placeLetter(new Coordinate(0, 1, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterB));
        const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
        expect(words).to.have.lengthOf(2);
        const stringList: string[] = words.map((word) => {
            return word.stringFormat;
        });
        expect(stringList).to.include.members(['aa', 'ab']);
    });
});
