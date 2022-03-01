/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Gameboard } from './gameboard.class';

describe('gameboard', () => {
    let gameboard: Gameboard;

    beforeEach(() => {
        gameboard = new Gameboard();
    });

    it('game array length should be 225', () => {
        expect(gameboard.gameboardTiles.length).to.equal(225);
    });

    it('constructor should create the array with each element being a GameboardCoordinate', () => {
        const checkArrayType = (coordList: LetterTile[]) => {
            let bool = true;
            coordList.forEach((coord: LetterTile) => {
                if (typeof coord !== 'object' && coord !== null) {
                    bool = false;
                }
            });
            return bool;
        };
        expect(checkArrayType(gameboard.gameboardTiles)).to.equal(true);
    });

    it('constructor should call createLetterTiles and applyBoxMultipliers', () => {
        const spyCreateLetterTiles = Sinon.spy(Gameboard.prototype, 'createLetterTiles');
        const spyApplyBoxMultipliers = Sinon.spy(Gameboard.prototype, 'applyBoxMultipliers');
        new Gameboard();
        expect(spyCreateLetterTiles.called).to.equal(true);
        expect(spyApplyBoxMultipliers.called).to.equal(true);
    });

    it('should place letter on board when placeLetter() is called', () => {
        const gameboardTestCoord = gameboard.gameboardTiles[0];
        gameboard.placeLetter({ x: 1, y: 1 }, 'a');

        expect(gameboardTestCoord.getLetter()).to.eql('a');
        expect(gameboardTestCoord.points).to.eql(1);
        expect(gameboardTestCoord.isOccupied).to.equal(true);
    });

    it('should set isOccupied attribute to false if removeLetter is called', () => {
        gameboard.gameboardTiles[0].setLetter('f');
        gameboard.removeLetter({ x: 1, y: 1 });

        expect(gameboard.gameboardTiles[0].isOccupied).to.equal(false);
        expect(gameboard.gameboardTiles[0].getLetter()).to.eql('');
    });

    it('should not change isOccupied attribute if removeLetter is called on a coord that is not occupied', () => {
        gameboard.removeLetter({ x: 5, y: 5 });
        expect(gameboard.getLetterTile({ x: 5, y: 5 }).isOccupied).to.equal(false);
    });

    it('should return correct LetterTile when getLetterTile is called', () => {
        gameboard.placeLetter({ x: 2, y: 2 }, 'c');
        expect(gameboard.getLetterTile({ x: 2, y: 2 }).getLetter()).to.eql('c');
        expect(gameboard.getLetterTile({ x: 2, y: 2 }).coordinate).to.equal({ x: 2, y: 2 });
    });

    it('should return false when if coordinates are less than 1', () => {
        gameboard.placeLetter({ x: -1, y: -1 }, '');
        expect(gameboard.getLetterTile({ x: -1, y: -1 })).to.eql({} as LetterTile);
    });

    it('should return false when if coordinates are greater than 15', () => {
        gameboard.placeLetter({ x: 16, y: 16 }, '');
        expect(gameboard.getLetterTile({ x: 16, y: 16 })).to.eql({} as LetterTile);
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

// MIGHT BE USEFUL IN WORD TESTS -----------------------------------------------------------------------
// context('First Coordinate verification', () => {
//     it('should return false if the first coord is occupied on the gameboard', () => {
//         gameboard.placeLetter({ x: 2, y: 2 }, '');
//         expect(gameboard['isFirstCoordValid'](new LetterTile(2, 2, {} as Letter))).to.equal(false);
//     });

//     it('should return false if the firstCoord is out of bounds on the gameboard', () => {
//         expect(gameboard['isFirstCoordValid'](new LetterTile(16, 0, {} as Letter))).to.equal(false);
//     });

//     it('should return true if firstCoord is not occupied on the gameboard', () => {
//         expect(gameboard['isFirstCoordValid'](new LetterTile(4, 4, {} as Letter))).to.equal(true);
//     });
// });

// context('validateCoordinate() should return empty list if string goes out of bound', () => {
//     let firstCoord: LetterTile;
//     let word: string[];
//     beforeEach(() => {
//         firstCoord = new LetterTile(14, 14, {} as Letter);
//         word = ['a', 'a', 'a', 'a'];
//     });
//     it('horizontal', () => {
//         const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
//     });

//     it('vertical', () => {
//         const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
//     });
// });

// context('validateCoordinate() should return empty list if string goes out of bound and there is already placed Letters', () => {
//     let word: string[];
//     beforeEach(() => {
//         gameboard.placeLetter(new LetterTile(14, 11, {} as Letter));
//         gameboard.placeLetter(new LetterTile(15, 1, {} as Letter));
//         gameboard.placeLetter(new LetterTile(1, 14, {} as Letter));
//         gameboard.placeLetter(new LetterTile(1, 15, {} as Letter));
//         word = ['a', 'a', 'a', 'a'];
//     });
//     it('horizontal', () => {
//         const coord = new LetterTile(13, 1, {} as Letter);
//         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
//     });
//     it('vertical', () => {
//         const coord = new LetterTile(1, 13, {} as Letter);
//         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
//     });
// });

// context('validateCoordinate() should return placedLetters array if placement is valid and there is no letters on the gameboard', () => {
//     let word: string[];
//     let coord: LetterTile;
//     beforeEach(() => {
//         word = ['a', 'a', 'a', 'a'];
//         coord = new LetterTile(1, 1, letterA);
//     });
//     it('horizontal', () => {
//         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'h', lettersPlaced: word };
//         const expectedCoordList = [
//             new LetterTile(1, 1, letterA),
//             new LetterTile(2, 1, letterA),
//             new LetterTile(3, 1, letterA),
//             new LetterTile(4, 1, letterA),
//         ];
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
//     });

//     it('vertical', () => {
//         const commandInfo: CommandInfo = { firstCoordinate: coord, direction: 'v', lettersPlaced: word };
//         const expectedCoordList = [
//             new LetterTile(1, 1, letterA),
//             new LetterTile(1, 2, letterA),
//             new LetterTile(1, 3, letterA),
//             new LetterTile(1, 4, letterA),
//         ];
//         expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
//     });
// });

// it('should return correct placedLetters array if placement is valid horizontally and there is already letters on the gameboard', () => {
//     const firstCoord = new LetterTile(5, 6, {} as Letter);
//     gameboard.placeLetter(new LetterTile(6, 6, {} as Letter));
//     gameboard.placeLetter(new LetterTile(7, 6, {} as Letter));
//     gameboard.placeLetter(new LetterTile(8, 6, {} as Letter));
//     const word: string[] = ['a', 'a', 'b'];
//     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
//     const expectedCoordList = [new LetterTile(5, 6, letterA), new LetterTile(9, 6, letterA), new LetterTile(10, 6, letterB)];
//     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
// });

// it('should return correct placedLetters array if placement is valid vertically and there is already letters on the gameboard', () => {
//     const firstCoord = new LetterTile(5, 6, {} as Letter);
//     gameboard.placeLetter(new LetterTile(5, 7, {} as Letter));
//     gameboard.placeLetter(new LetterTile(5, 8, {} as Letter));
//     gameboard.placeLetter(new LetterTile(5, 9, {} as Letter));
//     const word: string[] = ['a', 'a', 'b'];
//     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'v', lettersPlaced: word };
//     const expectedCoordList = [new LetterTile(5, 6, letterA), new LetterTile(5, 10, letterA), new LetterTile(5, 11, letterB)];
//     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql(expectedCoordList);
// });

// it('validateCoordinate() should only return the firstCoord if only one letter has been placed ', () => {
//     const firstCoord: LetterTile = new LetterTile(1, 1, { value: 'a' } as Letter);
//     const word: string[] = ['a'];
//     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
//     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.deep.equal([firstCoord]);
// });

// it('validateCoordinate() should return empty list if coordinate is already placed on the gameboard', () => {
//     gameboard.placeLetter(new LetterTile(4, 4, {} as Letter));
//     const firstCoord: LetterTile = new LetterTile(4, 4, { value: 'a' } as Letter);
//     const word: string[] = ['a'];
//     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: '', lettersPlaced: word };
//     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.deep.equal([]);
// });

// it('validateCoordinate() should return empty list if coordList is not adjacent horizontally or vertically to placed Letters', () => {
//     gameboard.placeLetter(new LetterTile(15, 15, letterA));
//     const firstCoord: LetterTile = new LetterTile(1, 1, { value: 'a' } as Letter);
//     const word: string[] = ['a'];
//     const commandInfo: CommandInfo = { firstCoordinate: firstCoord, direction: 'h', lettersPlaced: word };
//     expect(gameboard.validateGameboardCoordinate(commandInfo)).to.eql([]);
// });

// context('isThereAdjacentLetters() tests', () => {
//     let testCoordinate: LetterTile;
//     let upLeftCoord: LetterTile;
//     let downRightCoord: LetterTile;
//     beforeEach(() => {
//         testCoordinate = new LetterTile(8, 8, letterA);
//         upLeftCoord = new LetterTile(1, 1, letterA);
//         downRightCoord = new LetterTile(15, 15, letterA);
//     });

//     it('should return false if there is no adjacent letters', () => {
//         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(false);
//     });

//     it('should return true if upward tile is occupied', () => {
//         gameboard.placeLetter(new LetterTile(8, 7, letterA));
//         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
//     });

//     it('should return true if downward tile is occupied', () => {
//         gameboard.placeLetter(new LetterTile(8, 9, letterA));
//         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
//     });

//     it('should return true if right tile is occupied', () => {
//         gameboard.placeLetter(new LetterTile(9, 8, letterA));
//         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
//     });

//     it('should return true if left tile is occupied', () => {
//         gameboard.placeLetter(new LetterTile(7, 8, letterA));
//         expect(gameboard['isThereAdjacentLetters'](testCoordinate)).to.equal(true);
//     });

// PROBABLY IN LETTER-PLACEMENT SERVICE -------------------------------------------------------------------------------------------
//     it('should not call getLetterTile with specific arguments if coordinate.y or coordinate.x equals 1', () => {
//         const spyGetLetterTile = Sinon.spy(gameboard, 'getLetterTile');
//         const arg1 = new LetterTile(upLeftCoord.x, upLeftCoord.y - 1, {} as Letter);
//         const arg2 = new LetterTile(upLeftCoord.x + 1, upLeftCoord.y, {} as Letter);
//         gameboard['isThereAdjacentLetters'](upLeftCoord);
//         expect(spyGetLetterTile.calledWithExactly(arg1)).to.equal(false);
//         expect(spyGetLetterTile.calledWithExactly(arg2)).to.equal(false);
//     });

//     it('should not call getLetterTile with specific arguments if coordinate.y or coordinate.x equals 15', () => {
//         const spyGetLetterTile = Sinon.spy(gameboard, 'getLetterTile');
//         const arg1 = new LetterTile(downRightCoord.x, downRightCoord.y + 1, {} as Letter);
//         const arg2 = new LetterTile(downRightCoord.x - 1, downRightCoord.y, {} as Letter);
//         gameboard['isThereAdjacentLetters'](downRightCoord);
//         expect(spyGetLetterTile.calledWithExactly(arg1)).to.equal(false);
//         expect(spyGetLetterTile.calledWithExactly(arg2)).to.equal(false);
//     });
// });

// context('verifyLetterContact tests', () => {
//     let letterCoords: LetterTile[];
//     beforeEach(() => {
//         letterCoords = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterA)];
//     });
//     it('should return true if gameboard is not occupied by any letters', () => {
//         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
//     });

//     it('should return true if there is a vertically adjacent placed letter on the board', () => {
//         gameboard.placeLetter(new LetterTile(1, 2, letterA));
//         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
//     });

//     it('should return true if there is a horizontally adjacent placed letter on the board', () => {
//         gameboard.placeLetter(new LetterTile(4, 1, letterA));
//         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(true);
//     });

//     it('should return false if letter placed on the board is diagonal to coordinate', () => {
//         gameboard.placeLetter(new LetterTile(4, 2, letterA));
//         expect(gameboard['verifyLettersContact'](letterCoords)).to.equal(false);
//     });
// });
