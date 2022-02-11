/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable prettier/prettier */
import { Gameboard } from '@app/classes/Gameboard.class';
import { Word } from '@app/classes/Word.class';
import { Coordinate } from '@common/Coordinate';
import { LetterTile } from '@common/LetterTile.class';
import { expect } from 'chai';
import { Container } from 'typedi';
import { BoxMultiplier } from './box-multiplier.service';
import { WordFinderService } from './word-finder.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

// TODO : the rest of the tests
describe('Word', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplier;
    let wordFinderService: WordFinderService;
    const letterTileA: LetterTile = {} as LetterTile;
    const letterTileB: LetterTile = {} as LetterTile;
    const letterTileC: LetterTile = {} as LetterTile;
    let letter: LetterTile;

    beforeEach(async () => {
        letter = new LetterTile({ x: 0, y: 0 }, '');
        boxMultiplierService = Container.get(BoxMultiplier);
        wordFinderService = Container.get(WordFinderService);
        gameboard = new Gameboard(boxMultiplierService);
        const letterTileA: LetterTile = new LetterTile({ x: 0, y: 0 }, 'A');
        const letterTileB: LetterTile = new LetterTile({ x: 1, y: 0 }, 'B');
        const letterTileC: LetterTile = new LetterTile({ x: 2, y: 0 }, 'C');
    });

    it('should correctly set class attributes when constructor is called', () => {
        expect(letter.coordinate.x && letter.coordinate.y).to.equal(0);
        expect(letter.multiplier).to.equal(1);
        expect(letter.isOccupied).to.equal(false);
        expect(letter.value).to.eql({} as LetterTile);
    });

    it('buildFirstWord should build word with string being abc', () => {
        gameboard.placeLetter(letterTileA.coordinate, letterTileA.value);
        gameboard.placeLetter(letterTileB.coordinate, letterTileB.value);
        gameboard.placeLetter(letterTileC.coordinate, letterTileC.value);
        const placedLetterTiles: Coordinate[] = [
            new Coordinate(0, 0, letterTileA),
            new Coordinate(1, 0, letterTileB),
            new Coordinate(1, 0, letterTileC),
        ];
        const word: Word = wordFinderService.buildFirstWord(gameboard, placedLetterTiles);
        expect(word.stringFormat).to.eql('abc');
    });
});
