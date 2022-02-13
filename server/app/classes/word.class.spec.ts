import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Coordinate } from '@common/coordinate';
import { expect } from 'chai';
import { Container } from 'typedi';

// TODO : the rest of the tests
describe('Word', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;
    let word: Word;

    beforeEach(async () => {
        boxMultiplierService = Container.get(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
        gameboard.getLetterTile({ x: 2, y: 1 }).setLetter('a');
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
