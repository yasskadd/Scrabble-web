/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { BoxMultiplierService } from './box-multiplier.service';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';

describe('Coordinate validation service', () => {
    let gameboard: Gameboard;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplierService>;
    let coordinateValidation: GameboardCoordinateValidationService;
    let letterA: Letter;
    let letterB: Letter;

    beforeEach(() => {
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplierService);
        coordinateValidation = new GameboardCoordinateValidationService();
        gameboard = new Gameboard(boxMultiplierService);
        letterA = { value: 'a' } as Letter;
        letterB = { value: 'b' } as Letter;
    });

    context('First Coordinate verification', () => {
        it('should return false if theFirstCoord is occupied on the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, {} as Letter));
            expect(coordinateValidation['isFirstCoordValid'](new LetterTile(1, 1, {} as Letter), gameboard)).to.equal(false);
        });

        it('should return false if the firstCoord is out of bounds on the gameboard', () => {
            expect(coordinateValidation['isFirstCoordValid'](new LetterTile(15, 0, {} as Letter), gameboard)).to.equal(false);
        });

        it('should return true if firstCoord is not occupied on the gameboard', () => {
            expect(coordinateValidation['isFirstCoordValid'](new LetterTile(3, 3, {} as Letter), gameboard)).to.equal(true);
        });
    });

    context('validateCoordinate() should return empty list if string goes out of bound', () => {
        let firstCoord: LetterTile;
        let word: string[];
        beforeEach(() => {
            firstCoord = new LetterTile(13, 13, {} as Letter);
            word = ['a', 'a', 'a', 'a'];
        });
        it('horizontal', () => {
            const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
        });

        it('vertical', () => {
            const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
        });
    });

    context('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
        let word: string[];
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(13, 10, {} as Letter));
            gameboard.placeLetter(new LetterTile(14, 0, {} as Letter));
            gameboard.placeLetter(new LetterTile(0, 13, {} as Letter));
            gameboard.placeLetter(new LetterTile(0, 14, {} as Letter));
            word = ['a', 'a', 'a', 'a'];
        });
        it('horizontal', () => {
            const coord = new LetterTile(12, 0, {} as Letter);
            const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
        });
        it('vertical', () => {
            const coord = new LetterTile(0, 12, {} as Letter);
            const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
        });
    });

    context('validateCoordinate() should return placedLetters array if placement is valid and there is no letters on the gameboard', () => {
        let word: string[];
        let coord: LetterTile;
        beforeEach(() => {
            word = ['a', 'a', 'a', 'a'];
            letterA = { value: 'a' } as Letter;
            coord = new LetterTile(0, 0, letterA);
        });
        it('horizontal', () => {
            const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
            const expectedCoordList = [
                new LetterTile(0, 0, letterA),
                new LetterTile(1, 0, letterA),
                new LetterTile(2, 0, letterA),
                new LetterTile(3, 0, letterA),
            ];
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
        });

        it('vertical', () => {
            const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
            const expectedCoordList = [
                new LetterTile(0, 0, letterA),
                new LetterTile(0, 1, letterA),
                new LetterTile(0, 2, letterA),
                new LetterTile(0, 3, letterA),
            ];
            expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
        });
    });

    it('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
        const firstCoord = new LetterTile(4, 5, {} as Letter);
        gameboard.placeLetter(new LetterTile(5, 5, {} as Letter));
        gameboard.placeLetter(new LetterTile(6, 5, {} as Letter));
        gameboard.placeLetter(new LetterTile(7, 5, {} as Letter));
        const word: string[] = ['a', 'a', 'b'];
        const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
        const expectedCoordList = [new LetterTile(4, 5, letterA), new LetterTile(8, 5, letterA), new LetterTile(9, 5, letterB)];
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
    });

    it('should return correct placedLetters array if placement is valid vertically and there is already letters on the gameboard', () => {
        const firstCoord = new LetterTile(4, 5, {} as Letter);
        gameboard.placeLetter(new LetterTile(4, 6, {} as Letter));
        gameboard.placeLetter(new LetterTile(4, 7, {} as Letter));
        gameboard.placeLetter(new LetterTile(4, 8, {} as Letter));
        const word: string[] = ['a', 'a', 'b'];
        const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
        const expectedCoordList = [new LetterTile(4, 5, letterA), new LetterTile(4, 9, letterA), new LetterTile(4, 10, letterB)];
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
    });

    it('validateCoordinate() should only return the firstCoord if only one letter has been placed ', () => {
        const firstCoord: LetterTile = new LetterTile(0, 0, { value: 'a' } as Letter);
        const word: string[] = ['a'];
        const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([firstCoord]);
    });

    it('validateCoordinate() should return empty list if coordinate is already placed on the gameboard', () => {
        gameboard.placeLetter(new LetterTile(3, 3, {} as Letter));
        const firstCoord: LetterTile = new LetterTile(3, 3, { value: 'a' } as Letter);
        const word: string[] = ['a'];
        const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([]);
    });

    it('validateCoordinate() should return empty list if coordList is not adjacent horizontally or vertically to placed Letters', () => {
        gameboard.placeLetter(new LetterTile(14, 14, letterA));
        const firstCoord: LetterTile = new LetterTile(0, 0, { value: 'a' } as Letter);
        const word: string[] = ['a'];
        const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
        expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
    });

    context('isThereAdjacentLetters() tests', () => {
        let testCoordinate: LetterTile;
        let upLeftCoord: LetterTile;
        let downRightCoord: LetterTile;
        beforeEach(() => {
            testCoordinate = new LetterTile(7, 7, letterA);
            upLeftCoord = new LetterTile(0, 0, letterA);
            downRightCoord = new LetterTile(14, 14, letterA);
        });

        it('should return false if there is no adjacent letters', () => {
            expect(coordinateValidation['isThereAdjacentLetters'](testCoordinate, gameboard)).to.equal(false);
        });

        it('should return true if upward tile is occupied', () => {
            gameboard.placeLetter(new LetterTile(7, 6, letterA));
            expect(coordinateValidation['isThereAdjacentLetters'](testCoordinate, gameboard)).to.equal(true);
        });

        it('should return true if downward tile is occupied', () => {
            gameboard.placeLetter(new LetterTile(7, 8, letterA));
            expect(coordinateValidation['isThereAdjacentLetters'](testCoordinate, gameboard)).to.equal(true);
        });

        it('should return true if right tile is occupied', () => {
            gameboard.placeLetter(new LetterTile(8, 7, letterA));
            expect(coordinateValidation['isThereAdjacentLetters'](testCoordinate, gameboard)).to.equal(true);
        });

        it('should return true if left tile is occupied', () => {
            gameboard.placeLetter(new LetterTile(6, 7, letterA));
            expect(coordinateValidation['isThereAdjacentLetters'](testCoordinate, gameboard)).to.equal(true);
        });

        it('should not call getCoord with specific arguments if coordinate.y or coordinate.x equals 0', () => {
            const spyGetCoord = Sinon.spy(gameboard, 'getCoord');
            const arg1 = new LetterTile(upLeftCoord.x, upLeftCoord.y - 1, {} as Letter);
            const arg2 = new LetterTile(upLeftCoord.x + 1, upLeftCoord.y, {} as Letter);
            coordinateValidation['isThereAdjacentLetters'](upLeftCoord, gameboard);
            expect(spyGetCoord.calledWithExactly(arg1)).to.equal(false);
            expect(spyGetCoord.calledWithExactly(arg2)).to.equal(false);
        });

        it('should not call getCoord with specific arguments if coordinate.y or coordinate.x equals 14', () => {
            const spyGetCoord = Sinon.spy(gameboard, 'getCoord');
            const arg1 = new LetterTile(downRightCoord.x, downRightCoord.y + 1, {} as Letter);
            const arg2 = new LetterTile(downRightCoord.x - 1, downRightCoord.y, {} as Letter);
            coordinateValidation['isThereAdjacentLetters'](downRightCoord, gameboard);
            expect(spyGetCoord.calledWithExactly(arg1)).to.equal(false);
            expect(spyGetCoord.calledWithExactly(arg2)).to.equal(false);
        });
    });

    context('verifyLetterContact tests', () => {
        let letterCoords: LetterTile[];
        beforeEach(() => {
            letterCoords = [new LetterTile(0, 0, letterA), new LetterTile(1, 0, letterA), new LetterTile(2, 0, letterA)];
        });
        it('should return true if gameboard is not occupied by any letters', () => {
            expect(coordinateValidation['verifyLettersContact'](letterCoords, gameboard)).to.equal(true);
        });

        it('should return true if there is a vertically adjacent placed letter on the board', () => {
            gameboard.placeLetter(new LetterTile(0, 1, letterA));
            expect(coordinateValidation['verifyLettersContact'](letterCoords, gameboard)).to.equal(true);
        });

        it('should return true if there is a horizontally adjacent placed letter on the board', () => {
            gameboard.placeLetter(new LetterTile(3, 0, letterA));
            expect(coordinateValidation['verifyLettersContact'](letterCoords, gameboard)).to.equal(true);
        });

        it('should return false if letter placed on the board is diagonal to coordinate', () => {
            gameboard.placeLetter(new LetterTile(3, 1, letterA));
            expect(coordinateValidation['verifyLettersContact'](letterCoords, gameboard)).to.equal(false);
        });
    });
});
