/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { Letter } from '@app/letter';
import { BoxMultiplier } from 'app/services/box-multiplier.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Coordinate } from './coordinate.class';
import { GameBoard } from './gameboard.class';
import Sinon = require('sinon');

describe('gameboard', () => {
    let gameboard: GameBoard;
    let boxMultiplierService: SinonStubbedInstance<BoxMultiplier>;

    beforeEach(() => {
        boxMultiplierService = createStubInstance(BoxMultiplier);
        gameboard = new GameBoard(boxMultiplierService);
    });

    it('game array length should be 225', () => {
        const length: number = gameboard.gameboardCoords.length;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(length).to.equal(225);
    });

    it('should create the array with each element being a Coordinate', () => {
        // const array = gameboard.gameboardCoords;
        const array = gameboard.gameboardCoords;
        const checkArrayType = (coordList: Coordinate[]) => {
            let bool = true;
            coordList.forEach((coord: Coordinate) => {
                if (typeof coord !== 'object' && coord !== null) {
                    bool = false;
                }
            });
            return bool;
        };
        expect(checkArrayType(array)).to.be.true;
    });

    it('should call createCoordinates and applyBoxMultipliers', () => {
        const spyCreateCoord = Sinon.spy(GameBoard.prototype, 'createCoordinates');
        new GameBoard(boxMultiplierService);
        expect(spyCreateCoord.called).to.be.true;
        expect(boxMultiplierService.applyBoxMultipliers.called).to.be.true;
    });

    it('should place letter on board if coordinate is not occupied', () => {
        const letter = new Letter();
        letter.stringChar = 'a';
        const coord = new Coordinate(0, 0, letter);
        const gameboardTestCoord = gameboard.gameboardCoords[0];
        gameboardTestCoord.isOccupied = false;
        gameboard.placeLetter(coord);
        expect(gameboardTestCoord.x).to.eql(coord.x);
        expect(gameboardTestCoord.y).to.eql(coord.y);
        expect(gameboardTestCoord.letter.stringChar).to.eql('a');
        expect(gameboardTestCoord.isOccupied).to.be.true;
    });

    it('should not place letter on board if coordinate is occupied', () => {
        const coord = new Coordinate(0, 0, new Letter());
        const gameboardTestCoord = gameboard.gameboardCoords[0];
        gameboardTestCoord.isOccupied = true;
        expect(gameboard.placeLetter(coord)).to.be.false;
    });

    it('should set isOccupied attribute to false if removeLetter is called', () => {
        const gameboardCoord = gameboard.gameboardCoords[0];
        gameboardCoord.isOccupied = true;
        gameboardCoord.letter.stringChar = 'f';
        const coord = new Coordinate(0, 0, {} as Letter);
        gameboard.removeLetter(coord);
        expect(gameboardCoord.x).to.eql(coord.x);
        expect(gameboardCoord.y).to.eql(coord.y);
        expect(gameboardCoord.isOccupied).to.be.false;
        expect(gameboardCoord.letter).to.eql({} as Letter);
    });

    it('should return correct Coordinate when getCoord is called', () => {
        const letter = new Letter();
        letter.stringChar = 'c';
        const coord = new Coordinate(1, 1, letter);
        gameboard.placeLetter(coord);
        const newCoord = new Coordinate(1, 1, {} as Letter);
        expect(gameboard.getCoord(newCoord).letter.stringChar).to.eql('c');
        expect(gameboard.getCoord(newCoord).x).to.equal(1);
        expect(gameboard.getCoord(newCoord).y).to.equal(1);
    });
});
