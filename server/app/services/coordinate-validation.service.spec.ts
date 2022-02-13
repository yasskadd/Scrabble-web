// /* eslint-disable @typescript-eslint/no-magic-numbers */
// import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
// import { GameBoard } from '@app/classes/gameboard.class';
// import { PlacementCommandInfo } from '@app/command-info';
// import { Letter } from '@common/letter';
// import { expect } from 'chai';
// import * as Sinon from 'sinon';
// import { Container } from 'typedi';
// import { BoxMultiplier } from './box-multiplier.service';
// import { GameboardCoordinateValidationService } from './coordinate-validation.service';

// describe('Coordinate validation service', () => {
//     let gameboard: GameBoard;
//     let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplier>;
//     let coordinateValidation: GameboardCoordinateValidationService;
//     let letterA: Letter;
//     let letterB: Letter;

//     beforeEach(() => {
//         boxMultiplierService = Sinon.createStubInstance(BoxMultiplier);
//         coordinateValidation = Container.get(GameboardCoordinateValidationService);
//         gameboard = new GameBoard(boxMultiplierService);
//         letterA = { stringChar: 'a' } as Letter;
//         letterB = { stringChar: 'b' } as Letter;
//     });
//     it('should return false if theFirstCoord is occupied on the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(1, 1, {} as Letter));
//         expect(coordinateValidation.isFirstCoordValid(new GameboardCoordinate(1, 1, {} as Letter), gameboard)).to.equal(false);
//     });

//     it('should return false if the firstCoord is out of bounds on the gameboard', () => {
//         expect(coordinateValidation.isFirstCoordValid(new GameboardCoordinate(15, 0, {} as Letter), gameboard)).to.equal(false);
//     });

//     it('should return true if firstCoord is not occupied on the gameboard', () => {
//         expect(coordinateValidation.isFirstCoordValid(new GameboardCoordinate(3, 3, {} as Letter), gameboard)).to.equal(true);
//     });

//     context('validateCoordinate() should return empty list if string goes out of bound', () => {
//         let firstCoord: GameboardCoordinate;
//         let word: string[];
//         beforeEach(() => {
//             firstCoord = new GameboardCoordinate(13, 13, {} as Letter);
//             word = ['a', 'a', 'a', 'a'];
//         });
//         it('horizontal', () => {
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
//         });

//         it('vertical', () => {
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
//         });
//     });

//     context('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
//         let word: string[];
//         beforeEach(() => {
//             gameboard.placeLetter(new GameboardCoordinate(13, 10, {} as Letter));
//             gameboard.placeLetter(new GameboardCoordinate(14, 0, {} as Letter));
//             gameboard.placeLetter(new GameboardCoordinate(0, 13, {} as Letter));
//             gameboard.placeLetter(new GameboardCoordinate(0, 14, {} as Letter));
//             word = ['a', 'a', 'a', 'a'];
//         });
//         it('horizontal', () => {
//             const coord = new GameboardCoordinate(12, 0, {} as Letter);
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
//         });
//         it('vertical', () => {
//             const coord = new GameboardCoordinate(0, 12, {} as Letter);
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql([]);
//         });
//     });

//     context('should return placedLetters array if placement is valid and there is no letters on the gameboard', () => {
//         let word: string[];
//         let coord: GameboardCoordinate;
//         beforeEach(() => {
//             word = ['a', 'a', 'a', 'a'];
//             letterA = { stringChar: 'a' } as Letter;
//             coord = new GameboardCoordinate(0, 0, letterA);
//         });
//         it('horizontal', () => {
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
//             const expectedCoordList = [
//                 new GameboardCoordinate(0, 0, letterA),
//                 new GameboardCoordinate(1, 0, letterA),
//                 new GameboardCoordinate(2, 0, letterA),
//                 new GameboardCoordinate(3, 0, letterA),
//             ];
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
//         });

//         it('vertical', () => {
//             const commandInfo: PlacementCommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
//             const expectedCoordList = [
//                 new GameboardCoordinate(0, 0, letterA),
//                 new GameboardCoordinate(0, 1, letterA),
//                 new GameboardCoordinate(0, 2, letterA),
//                 new GameboardCoordinate(0, 3, letterA),
//             ];
//             expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
//         });
//     });

//     it('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
//         const firstCoord = new GameboardCoordinate(4, 5, {} as Letter);
//         gameboard.placeLetter(new GameboardCoordinate(5, 5, {} as Letter));
//         gameboard.placeLetter(new GameboardCoordinate(6, 5, {} as Letter));
//         gameboard.placeLetter(new GameboardCoordinate(7, 5, {} as Letter));
//         const word: string[] = ['a', 'a', 'b'];
//         const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
//         const expectedCoordList = [
//             new GameboardCoordinate(4, 5, letterA),
//             new GameboardCoordinate(8, 5, letterA),
//             new GameboardCoordinate(9, 5, letterB),
//         ];
//         expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
//     });

//     it('should return correct placedLetters array if placement is valid vertically and there is already letters on the gameboard', () => {
//         const firstCoord = new GameboardCoordinate(4, 5, {} as Letter);
//         gameboard.placeLetter(new GameboardCoordinate(4, 6, {} as Letter));
//         gameboard.placeLetter(new GameboardCoordinate(4, 7, {} as Letter));
//         gameboard.placeLetter(new GameboardCoordinate(4, 8, {} as Letter));
//         const word: string[] = ['a', 'a', 'b'];
//         const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
//         const expectedCoordList = [
//             new GameboardCoordinate(4, 5, letterA),
//             new GameboardCoordinate(4, 9, letterA),
//             new GameboardCoordinate(4, 10, letterB),
//         ];
//         expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.eql(expectedCoordList);
//     });

//     it('validateCoordinate() should only return the firstCoord if only one letter has been placed ', () => {
//         const firstCoord: GameboardCoordinate = new GameboardCoordinate(0, 0, { stringChar: 'a' } as Letter);
//         const word: string[] = ['a'];
//         const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
//         expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([firstCoord]);
//     });

//     it('validateCoordinate() should return empty list if coordinate is already placed on the gameboard', () => {
//         gameboard.placeLetter(new GameboardCoordinate(3, 3, {} as Letter));
//         const firstCoord: GameboardCoordinate = new GameboardCoordinate(3, 3, { stringChar: 'a' } as Letter);
//         const word: string[] = ['a'];
//         const commandInfo: PlacementCommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
//         expect(coordinateValidation.validateGameboardCoordinate(commandInfo, gameboard)).to.deep.equal([]);
//     });
// });
