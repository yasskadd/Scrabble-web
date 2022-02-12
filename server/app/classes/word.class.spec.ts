import { Gameboard } from '@app/classes/Gameboard.class';
import { Word } from '@app/classes/Word.class';
import { Coordinate } from '@common/Coordinate';
import { expect } from 'chai';
import { Container } from 'typedi';
import { BoxMultiplierService } from '../services/box-multiplier.service';

// TODO : the rest of the tests
describe('Word', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;
    let word: Word;

    beforeEach(async () => {
        boxMultiplierService = Container.get(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
        gameboard.getLetterTile({ x: 2, y: 1 }).value = 'A';
        gameboard.getLetterTile({ x: 2, y: 1 }).isOccupied = true;

        word = new Word(true, { x: 1, y: 1 }, 'SINTE', gameboard);
    });

    it('should correctly set class attributes when constructor is called', () => {
        const expectedWordCoords: Coordinate[] = [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 5, y: 1 },
            { x: 6, y: 1 },
        ];
        const expectedNewLetterCoords: Coordinate[] = [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 5, y: 1 },
            { x: 6, y: 1 },
        ];
        expect(word.isHorizontal).to.equal(true);
        expect(word.isValid).to.equal(false);
        expect(word.wordCoords).to.equal(expectedWordCoords);
        expect(word.newLetterCoords).to.equal(expectedNewLetterCoords);
        expect(word.points).to.equal(0);
    });
});
