// /* eslint-disable import/no-unresolved */
// /* eslint-disable prettier/prettier */
// import { Gameboard } from '@app/classes/Gameboard.class';
// import { Word } from '@app/classes/Word.class';
// import { Coordinate } from '@common/Coordinate';
// import { LetterTile } from '@common/LetterTile.class';
// import { expect } from 'chai';
// import { Container } from 'typedi';
// import { BoxMultiplier } from './box-multiplier.service';
// import { WordFinderService } from './word-finder.service';

// describe.only('WordFinderService', () => {
//     let gameboard: Gameboard;
//     let boxMultiplierService: BoxMultiplier;
//     let wordFinderService: WordFinderService;
//     const letterTileA: LetterTile = {} as LetterTile;
//     const letterTileB: LetterTile = {} as LetterTile;
//     const letterTileC: LetterTile = {} as LetterTile;

//     beforeEach(() => {
//         boxMultiplierService = Container.get(BoxMultiplier);
//         wordFinderService = Container.get(WordFinderService);
//         gameboard = new Gameboard(boxMultiplierService);
//         const letterTileA: LetterTile = new LetterTile({ x: 0, y: 0 }, 'A');
//         const letterTileB: LetterTile = new LetterTile({ x: 1, y: 0 }, 'B');
//         const letterTileC: LetterTile = new LetterTile({ x: 2, y: 0 }, 'C');
//     });

//     it('buildFirstWord should build word with string being abc', () => {
//         gameboard.placeLetter(letterTileA.coordinate, letterTileA.value);
//         gameboard.placeLetter(letterTileB.coordinate, letterTileB.value);
//         gameboard.placeLetter(letterTileC.coordinate, letterTileC.value);
//         const placedLetterTiles: Coordinate[] = [
//             new Coordinate(0, 0, letterTileA),
//             new Coordinate(1, 0, letterTileB),
//             new Coordinate(1, 0, letterTileC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetterTiles);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildFirstWord should build word with string being abc', () => {
//         gameboard.placeLetter(letterTileA.coordinate, letterTileA.value);
//         gameboard.placeLetter(letterTileB.coordinate, letterTileB.value);
//         gameboard.placeLetter(letterTileC.coordinate, letterTileC.value);
//         const placedLetterTiles: Coordinate[] = [
//             new Coordinate(0, 0, letterTileA),
//             new Coordinate(1, 0, letterTileB),
//             new Coordinate(1, 0, letterTileC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetterTiles);
//         expect(word.stringFormat).to.eql('abc');
//     });
// });
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */

// OLD CODE

// import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
// import { GameBoard } from '@app/classes/gameboard.class';
// import { Word } from '@app/classes/word.class';
// import { Letter } from '@common/letter';
// import { expect } from 'chai';
// import { Container } from 'typedi';
// import { BoxMultiplier } from './box-multiplier.service';
// import { WordFinderService } from './word-finder.service';

// describe('WordFinderService', () => {
//     let gameboard: GameBoard;
//     let boxMultiplierService: BoxMultiplier;
//     let wordFinderService: WordFinderService;
//     const letterA: Letter = {} as Letter;
//     const letterB: Letter = {} as Letter;
//     const letterC: Letter = {} as Letter;

//     beforeEach(() => {
//         boxMultiplierService = Container.get(BoxMultiplier);
//         wordFinderService = Container.get(WordFinderService);
//         gameboard = new GameBoard(boxMultiplierService);
//         letterA.stringChar = 'a';
//         letterB.stringChar = 'b';
//         letterC.stringChar = 'c';
//     });

//     it('buildFirstWord should build word with string abc if all placedLetters form abc', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(1, 0, letterB),
//             new GameboardCoordinate(1, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(1, 0, letterB), new GameboardCoordinate(2, 0, letterC)];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildFirstWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(3, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(4, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(5, 0, letterC));
//         gameboard.placeLetter(new GameboardCoordinate(6, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(1, 0, letterA),
//             new GameboardCoordinate(3, 0, letterB),
//             new GameboardCoordinate(5, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('aabbcc');
//         expect(word.isHorizontal).to.be.true;
//     });

//     it('buildFirstWord should build string if there is already occupied squares between placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 3, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 4, letterC));
//         gameboard.placeLetter(new GameboardCoordinate(0, 5, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 4, letterA),
//             new GameboardCoordinate(0, 2, letterB),
//             new GameboardCoordinate(0, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('aabbcc');
//         expect(word.isHorizontal).to.be.false;
//     });

//     it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
//         expect(word.stringFormat).to.eql('');
//     });

//     it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(0, 1, letterB),
//             new GameboardCoordinate(0, 2, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 12, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 13, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 14, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 12, letterA),
//             new GameboardCoordinate(0, 13, letterB),
//             new GameboardCoordinate(0, 14, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 3, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 1, letterA),
//             new GameboardCoordinate(0, 2, letterB),
//             new GameboardCoordinate(0, 3, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
//         expect(word.stringFormat).to.eql('');
//     });

//     it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(1, 0, letterB),
//             new GameboardCoordinate(2, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(12, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(13, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(14, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(12, 0, letterA),
//             new GameboardCoordinate(13, 0, letterB),
//             new GameboardCoordinate(14, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(3, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(1, 0, letterA),
//             new GameboardCoordinate(2, 0, letterB),
//             new GameboardCoordinate(3, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(1);
//         expect(words[0].stringFormat).to.eql('abc');
//         expect(words[0].isHorizontal).to.be.true;
//     });

//     it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(1);
//         expect(words[0].stringFormat).to.eql('abc');
//         expect(words[0].isHorizontal).to.be.false;
//     });

//     it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(2);
//         const stringList: string[] = words.map((word) => {
//             return word.stringFormat;
//         });
//         expect(stringList).to.include.members(['aa', 'ab']);
//     });
// });

// import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
// import { GameBoard } from '@app/classes/gameboard.class';
// import { Word } from '@app/classes/word.class';
// import { Letter } from '@common/letter';
// import { expect } from 'chai';
// import { Container } from 'typedi';
// import { BoxMultiplier } from './box-multiplier.service';
// import { WordFinderService } from './word-finder.service';

// describe.only('WordFinderService', () => {
//     let gameboard: GameBoard;
//     let boxMultiplierService: BoxMultiplier;
//     let wordFinderService: WordFinderService;
//     const letterA: Letter = {} as Letter;
//     const letterB: Letter = {} as Letter;
//     const letterC: Letter = {} as Letter;

//     beforeEach(() => {
//         boxMultiplierService = Container.get(BoxMultiplier);
//         wordFinderService = Container.get(WordFinderService);
//         gameboard = new GameBoard(boxMultiplierService);
//         letterA.stringChar = 'a';
//         letterB.stringChar = 'b';
//         letterC.stringChar = 'c';
//     });

//     it('buildFirstWord should build word with string abc if all placedLetters form abc', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(1, 0, letterB),
//             new GameboardCoordinate(1, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildFirstWord should build string abc if only a,b are the placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [new GameboardCoordinate(1, 0, letterB), new GameboardCoordinate(2, 0, letterC)];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildFirstWord should build string aabbcc if there is already occupied squares between placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(3, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(4, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(5, 0, letterC));
//         gameboard.placeLetter(new GameboardCoordinate(6, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(1, 0, letterA),
//             new GameboardCoordinate(3, 0, letterB),
//             new GameboardCoordinate(5, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('aabbcc');
//         expect(word.isHorizontal).to.be.true;
//     });

//     it('buildFirstWord should build string if there is already occupied squares between placedLetters', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 3, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 4, letterC));
//         gameboard.placeLetter(new GameboardCoordinate(0, 5, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 4, letterA),
//             new GameboardCoordinate(0, 2, letterB),
//             new GameboardCoordinate(0, 0, letterC),
//         ];
//         const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetters);
//         expect(word.stringFormat).to.eql('aabbcc');
//         expect(word.isHorizontal).to.be.false;
//     });

//     it('buildVerticalWord should return a word with empty string if there is no vertical word on board', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
//         expect(word.stringFormat).to.eql('');
//     });

//     it('buildVertical should return word with string if word is on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(0, 1, letterB),
//             new GameboardCoordinate(0, 2, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildVertical should return word with string if word is on the opposite edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 12, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 13, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 14, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 12, letterA),
//             new GameboardCoordinate(0, 13, letterB),
//             new GameboardCoordinate(0, 14, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildVertical should return word with string if word is not on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 3, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 1, letterA),
//             new GameboardCoordinate(0, 2, letterB),
//             new GameboardCoordinate(0, 3, letterC),
//         ];
//         const word: Word = wordFinderService['buildVerticalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return a word with empty string if there is no horizontal word on board', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, new GameboardCoordinate(0, 0, letterA));
//         expect(word.stringFormat).to.eql('');
//     });

//     it('buildHorizontal should return word with string if word is on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(0, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(0, 0, letterA),
//             new GameboardCoordinate(1, 0, letterB),
//             new GameboardCoordinate(2, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return word with string if word is on the opposite edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(12, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(13, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(14, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(12, 0, letterA),
//             new GameboardCoordinate(13, 0, letterB),
//             new GameboardCoordinate(14, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('buildHorizontal should return word with string if word is not on the edge of the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(3, 0, letterC));
//         const placedLetters: GameboardCoordinate[] = [
//             new GameboardCoordinate(1, 0, letterA),
//             new GameboardCoordinate(2, 0, letterB),
//             new GameboardCoordinate(3, 0, letterC),
//         ];
//         const word: Word = wordFinderService['buildHorizontalWord'](gameboard, placedLetters[1]);
//         expect(word.stringFormat).to.eql('abc');
//     });

//     it('findNewWords should return a single word if there is one placedLetter and letters are horizontal', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(2, 0, letterC));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(1);
//         expect(words[0].stringFormat).to.eql('abc');
//         expect(words[0].isHorizontal).to.be.true;
//     });

//     it('findNewWords should return a single word if there is one placedLetter and letters are vertical', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterB));
//         gameboard.placeLetter(new GameboardCoordinate(0, 2, letterC));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(1);
//         expect(words[0].stringFormat).to.eql('abc');
//         expect(words[0].isHorizontal).to.be.false;
//     });

//     it('findNewWords should return an array of 2 words if there is one placedLetter related to 2 words', () => {
//         const placedLetter: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
//         gameboard.placeLetter(placedLetter[0]);
//         gameboard.placeLetter(new GameboardCoordinate(0, 1, letterA));
//         gameboard.placeLetter(new GameboardCoordinate(1, 0, letterB));
//         const words: Word[] = wordFinderService.findNewWords(gameboard, placedLetter);
//         expect(words).to.have.lengthOf(2);
//         const stringList: string[] = words.map((word) => {
//             return word.stringFormat;
//         });
//         expect(stringList).to.include.members(['aa', 'ab']);
//     });
// });
