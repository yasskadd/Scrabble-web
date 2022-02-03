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

describe.only('WordFinderService', () => {
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
        gameboard.placeLetter(new Coordinate(0, 0, letterA));
        gameboard.placeLetter(new Coordinate(1, 0, letterA));
        gameboard.placeLetter(new Coordinate(2, 0, letterB));
        gameboard.placeLetter(new Coordinate(3, 0, letterB));
        gameboard.placeLetter(new Coordinate(4, 0, letterC));
        gameboard.placeLetter(new Coordinate(5, 0, letterC));
        const placedLetters: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(2, 0, letterB), new Coordinate(4, 0, letterC)];
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
        const placedLetters: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(0, 2, letterB), new Coordinate(0, 4, letterC)];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
        expect(word.stringFormat).to.eql('ccbbaa');
        expect(word.isHorizontal).to.be.true;
    });
});
