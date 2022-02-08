import { Coordinate } from '@app/classes/coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Letter } from '@app/letter';
import { expect } from 'chai';
import Container from 'typedi';
import { BoxMultiplier } from './box-multiplier.service';
import { CoordinateValidationService } from './coordinate-validation.service';
import Sinon = require('sinon');

describe.only('Coordinate validation service', () => {
    let gameboard: GameBoard;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplier>;
    let coordinateValidation: CoordinateValidationService;

    beforeEach(() => {
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplier);
        coordinateValidation = Container.get(CoordinateValidationService);
        gameboard = new GameBoard(boxMultiplierService);
    });
    it.only('should return false if theFirstCoord is occupied on the gameboard', () => {
        gameboard.placeLetter(new Coordinate(1, 1, {} as Letter));
        expect(coordinateValidation.isFirstCoordValid(new Coordinate(1, 1, {} as Letter), gameboard)).to.equal(false);
    });

    it.only('validateCoordinate() should return empty list if string goes out of bound and direction is horizontal', () => {
        const firstCoord: Coordinate = new Coordinate(13, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        expect(coordinateValidation.validateCoordinate(word, firstCoord, 'h', gameboard)).to.eql([]);
    });

    it.only('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
        gameboard.placeLetter(new Coordinate(13, 0, {} as Letter));
        gameboard.placeLetter(new Coordinate(14, 0, {} as Letter));
        const coord = new Coordinate(12, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        expect(coordinateValidation.validateCoordinate(word, coord, 'h', gameboard)).to.eql([]);
    });

    it.only('should return placedLetters array if placement is valid horizontally and there is no letters on the gameboard', () => {
        const coord = new Coordinate(0, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        const letterA: Letter = { stringChar: 'a' } as Letter;
        const expectedCoordList = [
            new Coordinate(0, 0, letterA),
            new Coordinate(1, 0, letterA),
            new Coordinate(2, 0, letterA),
            new Coordinate(3, 0, letterA),
        ];
        expect(coordinateValidation.validateCoordinate(word, coord, 'h', gameboard)).to.eql(expectedCoordList);
    });

    it.only('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
        const firstCoord = new Coordinate(4, 5, {} as Letter);
        gameboard.placeLetter(new Coordinate(5, 5, {} as Letter));
        gameboard.placeLetter(new Coordinate(6, 5, {} as Letter));
        gameboard.placeLetter(new Coordinate(7, 5, {} as Letter));
        const word: string[] = ['a', 'a', 'b'];
        const letterA: Letter = { stringChar: 'a' } as Letter;
        const letterB: Letter = { stringChar: 'b' } as Letter;
        const expectedCoordList = [new Coordinate(4, 5, letterA), new Coordinate(8, 5, letterA), new Coordinate(9, 5, letterB)];
        expect(coordinateValidation.validateCoordinate(word, firstCoord, 'h', gameboard)).to.eql(expectedCoordList);
    });

    it.only('validateCoordinate() should only return the firstCoord if only one letter has been placed ', () => {
        const firstCoord: Coordinate = new Coordinate(0, 0, { stringChar: 'a' } as Letter);
        const word: string[] = ['a'];
        expect(coordinateValidation.validateCoordinate(word, firstCoord, 'u', gameboard)).to.deep.equal([firstCoord]);
    });

    it.only('validateCoordinate() should return empty list if coordinate is already placed on the gameboard', () => {
        gameboard.placeLetter(new Coordinate(3, 3, {} as Letter));
        const firstCoord: Coordinate = new Coordinate(3, 3, { stringChar: 'a' } as Letter);
        const word: string[] = ['a'];
        expect(coordinateValidation.validateCoordinate(word, firstCoord, 'u', gameboard)).to.deep.equal([]);
    });
});
