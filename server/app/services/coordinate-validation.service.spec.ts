/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { PlacementCommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { BoxMultiplier } from './box-multiplier.service';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';

describe.only('Coordinate validation service', () => {
    let gameboard: GameBoard;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplier>;
    let coordinateValidation: GameboardCoordinateValidationService;

    beforeEach(() => {
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplier);
        coordinateValidation = Container.get(GameboardCoordinateValidationService);
        gameboard = new GameBoard(boxMultiplierService);
    });
    it('should return false if theFirstCoord is occupied on the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(1, 1, {} as Letter));
        expect(coordinateValidation.isFirstCoordValid(new GameboardCoordinate(1, 1, {} as Letter), gameboard)).to.equal(false);
    });

    it('validateCoordinate() should return empty list if string goes out of bound and direction is horizontal', () => {
        const firstCoord: GameboardCoordinate = new GameboardCoordinate(13, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
    });

    it('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
        gameboard.placeLetter(new GameboardCoordinate(13, 0, {} as Letter));
        gameboard.placeLetter(new GameboardCoordinate(14, 0, {} as Letter));
        const coord = new GameboardCoordinate(12, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };

        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
    });

    it('should return placedLetters array if placement is valid horizontally and there is no letters on the gameboard', () => {
        const coord = new GameboardCoordinate(0, 0, {} as Letter);
        const word: string[] = ['a', 'a', 'a', 'a'];
        const letterA: Letter = { stringChar: 'a' } as Letter;
        const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
        const expectedCoordList = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(1, 0, letterA),
            new GameboardCoordinate(2, 0, letterA),
            new GameboardCoordinate(3, 0, letterA),
        ];
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
    });

    it('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
        const firstCoord = new GameboardCoordinate(4, 5, {} as Letter);
        gameboard.placeLetter(new GameboardCoordinate(5, 5, {} as Letter));
        gameboard.placeLetter(new GameboardCoordinate(6, 5, {} as Letter));
        gameboard.placeLetter(new GameboardCoordinate(7, 5, {} as Letter));
        const word: string[] = ['a', 'a', 'b'];
        const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
        const letterA: Letter = { stringChar: 'a' } as Letter;
        const letterB: Letter = { stringChar: 'b' } as Letter;
        const expectedCoordList = [
            new GameboardCoordinate(4, 5, letterA),
            new GameboardCoordinate(8, 5, letterA),
            new GameboardCoordinate(9, 5, letterB),
        ];
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
    });

    it('validateCoordinate() should only return the firstCoord if only one letter has been placed ', () => {
        const firstCoord: GameboardCoordinate = new GameboardCoordinate(0, 0, { stringChar: 'a' } as Letter);
        const word: string[] = ['a'];
        const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'u', lettersPlaced: word };

        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([firstCoord]);
    });

    it('validateCoordinate() should return empty list if coordinate is already placed on the gameboard', () => {
        gameboard.placeLetter(new GameboardCoordinate(3, 3, {} as Letter));
        const firstCoord: GameboardCoordinate = new GameboardCoordinate(3, 3, { stringChar: 'a' } as Letter);
        const word: string[] = ['a'];
        const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'u', lettersPlaced: word };

        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([]);
    });
});
