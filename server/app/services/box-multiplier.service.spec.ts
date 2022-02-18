/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Gameboard } from '@app/classes/gameboard.class';
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
        expect(gameboard.getLetterTile({ x: 4, y: 1 }).multiplier.number).to.equal(2);
        expect(gameboard.getLetterTile({ x: 4, y: 1 }).multiplier.type).to.equal('LETTRE');
    });

    it('should modify letterMultiplier to three for coordinate (6,2)', () => {
        expect(gameboard.getLetterTile({ x: 6, y: 2 }).multiplier.number).to.equal(3);
        expect(gameboard.getLetterTile({ x: 6, y: 2 }).multiplier.type).to.equal('LETTRE');
    });

    it('should modify wordMultiplier to two for coordinate (2,2)', () => {
        expect(gameboard.getLetterTile({ x: 2, y: 2 }).multiplier.number).to.equal(2);
        expect(gameboard.getLetterTile({ x: 2, y: 2 }).multiplier.type).to.equal('MOT');
    });

    it('should modify wordMultiplier to three for coordinate (6,2)', () => {
        expect(gameboard.getLetterTile({ x: 1, y: 1 }).multiplier.number).to.equal(3);
        expect(gameboard.getLetterTile({ x: 1, y: 1 }).multiplier.type).to.equal('MOT');
    });

    it('should modify wordMultiplier to two for middle coordinate (8,8)', () => {
        expect(gameboard.getLetterTile({ x: 8, y: 8 }).multiplier.number).to.equal(2);
        expect(gameboard.getLetterTile({ x: 8, y: 8 }).multiplier.type).to.equal('MOT');
    });
});
