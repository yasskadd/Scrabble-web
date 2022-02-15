/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameboardCoordinate } from './gameboard-coordinate.class';
import { Gameboard } from './gameboard.class';

describe.only('gameboard', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: SinonStubbedInstance<BoxMultiplierService>;

    beforeEach(() => {
        boxMultiplierService = createStubInstance(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('game array length should be 225', () => {
        const length: number = gameboard.gameboardCoords.length;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(length).to.equal(225);
    });

    it('should create the array with each element being a GameboardCoordinate', () => {
        // const array = gameboard.gameboardCoords;
        const array = gameboard.gameboardCoords;
        const checkArrayType = (coordList: GameboardCoordinate[]) => {
            let bool = true;
            coordList.forEach((coord: GameboardCoordinate) => {
                if (typeof coord !== 'object' && coord !== null) {
                    bool = false;
                }
            });
            return bool;
        };
        expect(checkArrayType(array)).to.be.true;
    });

    it('should call createGameboardCoordinates and applyBoxMultipliers', () => {
        const spyCreateCoord = Sinon.spy(Gameboard.prototype, 'createGameboardCoordinates');
        new Gameboard(boxMultiplierService);
        expect(spyCreateCoord.called).to.be.true;
        expect(boxMultiplierService.applyBoxMultipliers.called).to.be.true;
    });

    it('should place letter on board if GameboardCoordinate is not occupied', () => {
        const letter = {} as Letter;
        letter.value = 'a';
        const coord = new GameboardCoordinate(0, 0, letter);
        const gameboardTestCoord = gameboard.gameboardCoords[0];
        gameboardTestCoord.isOccupied = false;
        gameboard.placeLetter(coord);
        expect(gameboardTestCoord.x).to.eql(coord.x);
        expect(gameboardTestCoord.y).to.eql(coord.y);
        expect(gameboardTestCoord.letter.value).to.eql('a');
        expect(gameboardTestCoord.isOccupied).to.be.true;
    });

    it('should set isOccupied attribute to false if removeLetter is called', () => {
        const gameboardCoord = gameboard.gameboardCoords[0];
        gameboardCoord.isOccupied = true;
        gameboardCoord.letter.value = 'f';
        const coord = new GameboardCoordinate(0, 0, {} as Letter);
        gameboard.removeLetter(coord);
        expect(gameboardCoord.x).to.eql(coord.x);
        expect(gameboardCoord.y).to.eql(coord.y);
        expect(gameboardCoord.isOccupied).to.be.false;
        expect(gameboardCoord.letter).to.eql({} as Letter);
    });

    it('should return correct GameboardCoordinate when getCoord is called', () => {
        const letter = { value: 'c' } as Letter;
        const coord = new GameboardCoordinate(1, 1, letter);
        gameboard.placeLetter(coord);
        const newCoord = new GameboardCoordinate(1, 1, {} as Letter);
        expect(gameboard.getCoord(newCoord).letter.value).to.eql('c');
        expect(gameboard.getCoord(newCoord).x).to.equal(1);
        expect(gameboard.getCoord(newCoord).y).to.equal(1);
    });
});
