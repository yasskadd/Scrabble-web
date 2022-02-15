import { Gameboard } from '@app/classes/gameboard.class';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import { BoxMultiplierService } from './box-multiplier.service';

describe('BoxMultiplier', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;

    beforeEach(async () => {
        boxMultiplierService = new BoxMultiplierService();
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('should modify letterMultiplier to two for coordinate (4,1)', () => {
        expect(gameboard.getCoord(new LetterTile(4, 1, {} as Letter)).letterMultiplier).to.equal(2);
    });

    it('should modify letterMultiplier to three for coordinate (6,2)', () => {
        expect(gameboard.getCoord(new LetterTile(6, 2, {} as Letter)).letterMultiplier).to.equal(3);
    });

    it('should modify wordMultiplier to two for coordinate (2,2)', () => {
        expect(gameboard.getCoord(new LetterTile(2, 2, {} as Letter)).wordMultiplier).to.equal(2);
    });

    it('should modify wordMultiplier to three for coordinate (6,2)', () => {
        expect(gameboard.getCoord(new LetterTile(1, 1, {} as Letter)).wordMultiplier).to.equal(3);
    });
});
