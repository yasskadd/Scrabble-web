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
