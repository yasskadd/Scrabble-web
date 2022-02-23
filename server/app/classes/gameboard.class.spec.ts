/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Gameboard } from './gameboard.class';

describe('gameboard', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: SinonStubbedInstance<BoxMultiplierService>;

    beforeEach(() => {
        boxMultiplierService = createStubInstance(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('game array length should be 225', () => {
        const length: number = gameboard.gameboardCoords.length;
        expect(length).to.equal(225);
    });

    it('should create the array with each element being a GameboardCoordinate', () => {
        const array = gameboard.gameboardCoords;
        const checkArrayType = (coordList: LetterTile[]) => {
            let bool = true;
            coordList.forEach((coord: LetterTile) => {
                if (typeof coord !== 'object' && coord !== null) {
                    bool = false;
                }
            });
            return bool;
        };
        expect(checkArrayType(array)).to.equal(true);
    });

    it('should call createLetterTiles and applyBoxMultipliers', () => {
        const spyCreateCoord = Sinon.spy(Gameboard.prototype, 'createLetterTiles');
        new Gameboard(boxMultiplierService);
        expect(spyCreateCoord.called).to.equal(true);
        expect(boxMultiplierService.applyBoxMultipliers.called).to.equal(true);
    });

    it('should place letter on board when placeLetter() is called', () => {
        const letter = {} as Letter;
        letter.value = 'a';
        const coord = new LetterTile(1, 1, letter);
        const gameboardTestCoord = gameboard.gameboardCoords[0];
        gameboardTestCoord.isOccupied = false;
        gameboard.placeLetter(coord);
        expect(gameboardTestCoord.x).to.eql(coord.x);
        expect(gameboardTestCoord.y).to.eql(coord.y);
        expect(gameboardTestCoord.letter.value).to.eql('a');
        expect(gameboardTestCoord.isOccupied).to.equal(true);
    });

    it('should set isOccupied attribute to false if removeLetter is called', () => {
        const gameboardCoord = gameboard.gameboardCoords[0];
        gameboardCoord.isOccupied = true;
        gameboardCoord.letter.value = 'f';
        const coord = new LetterTile(1, 1, {} as Letter);
        gameboard.removeLetter(coord);
        expect(gameboardCoord.x).to.eql(coord.x);
        expect(gameboardCoord.y).to.eql(coord.y);
        expect(gameboardCoord.isOccupied).to.equal(false);
        expect(gameboardCoord.letter).to.eql({} as Letter);
    });

    it('should not change isOccupied attribute if removeLetter is called on a coord that is not occupied', () => {
        const coord: LetterTile = new LetterTile(5, 5, {} as Letter);
        gameboard.removeLetter(coord);
        expect(gameboard.getCoord(coord).isOccupied).to.equal(false);
    });

    it('should return correct LetterTile when getCoord is called', () => {
        const letter = { value: 'c' } as Letter;
        const coord = new LetterTile(2, 2, letter);
        gameboard.placeLetter(coord);
        const newCoord = new LetterTile(2, 2, {} as Letter);
        expect(gameboard.getCoord(newCoord).letter.value).to.eql('c');
        expect(gameboard.getCoord(newCoord).x).to.equal(2);
        expect(gameboard.getCoord(newCoord).y).to.equal(2);
    });

    it('should return empty object when if coord.x or coord.y is less than 1', () => {
        const coord = new LetterTile(-1, -1, {} as Letter);
        gameboard.placeLetter(coord);
        expect(gameboard.getCoord(coord)).to.eql({} as LetterTile);
    });

    it('should return empty object when if coord.x or coord.y is greater than 15', () => {
        const coord = new LetterTile(16, 16, {} as Letter);
        gameboard.placeLetter(coord);
        expect(gameboard.getCoord(coord)).to.eql({} as LetterTile);
    });

    context('findAnchors() tests', () => {
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(7, 7, {} as Letter));
        });

        it('findAnchors() should return correct anchors tiles', () => {
            const foundTiles: LetterTile[] = gameboard.findAnchors();
            console.log(foundTiles);
        });
    });
});
