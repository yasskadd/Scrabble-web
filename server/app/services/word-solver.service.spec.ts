/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Coordinate } from '@common/interfaces/coordinate';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordSolverService } from './word-solver.service';

describe('Word solver service', () => {
    let wordSolverService: WordSolverService;
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;
    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        dictionaryValidationService.createTrieDictionary();
        gameboard = new Gameboard();
        wordSolverService = new WordSolverService();
        wordSolverService['gameboard'] = gameboard;
    });

    // TODO: Temporary test, need modifications
    it('should find all options', () => {
        const rack: string[] = ['*'];
        gameboard.placeLetter({ x: 1, y: 12 }, 'z');
        gameboard.placeLetter({ x: 2, y: 1 }, 'l');
        gameboard.placeLetter({ x: 7, y: 10 }, 'a');
        gameboard.placeLetter({ x: 7, y: 8 }, 'j');
        gameboard.placeLetter({ x: 8, y: 8 }, 'e');
        wordSolverService.findAllOptions(rack);
        expect(wordSolverService.commandInfoScore(wordSolverService['commandInfoList']).size).to.be.greaterThan(1);
    });

    it(' setGameboard should set the gameboard attribute of the service', () => {
        const gameboardStub = new Gameboard();
        gameboardStub.placeLetter({ x: 1, y: 12 }, 'z');
        gameboardStub.placeLetter({ x: 2, y: 1 }, 'x');
        gameboardStub.placeLetter({ x: 2, y: 1 }, 'l');
        gameboardStub.placeLetter({ x: 7, y: 10 }, 'a');
        wordSolverService.setGameboard(gameboardStub);
        expect(wordSolverService['gameboard']).to.equal(gameboardStub);
    });

    context('Coordinate manipulation tests', () => {
        let upLeftCoordinate: Coordinate;
        let downRightCoordinate: Coordinate;
        let centerCoordinate: Coordinate;
        beforeEach(() => {
            upLeftCoordinate = { x: 1, y: 1 };
            downRightCoordinate = { x: 15, y: 15 };
            centerCoordinate = { x: 8, y: 8 };
        });

        it('incrementCoord should return a new Coordinate with x incremented if isHorizontal is true', () => {
            const newCoordinate = wordSolverService['incrementCoord'](centerCoordinate, true);
            expect(newCoordinate).to.eql({ x: 9, y: 8 });
        });

        it('incrementCoord should return a new Coordinate with y incremented if isHorizontal is false', () => {
            const newCoordinate = wordSolverService['incrementCoord'](centerCoordinate, false);
            expect(newCoordinate).to.eql({ x: 8, y: 9 });
        });

        it('incrementCoord should return null if the coordinate passed as an argument is on the edge of the board vertically or horizontally', () => {
            const newCoordinateHorizontal = wordSolverService['incrementCoord'](downRightCoordinate, true);
            const newCoordinateVertical = wordSolverService['incrementCoord'](downRightCoordinate, false);
            expect(newCoordinateHorizontal && newCoordinateVertical).to.eql(null);
        });

        it('decrementCoord should return a newCoordinate with x decremented if isHorizontal is true', () => {
            const newCoordinate = wordSolverService['decrementCoord'](centerCoordinate, true);
            expect(newCoordinate).to.eql({ x: 7, y: 8 });
        });

        it('decrementCoord should return a newCoordinate with y decremented if isHorizontal is false', () => {
            const newCoordinate = wordSolverService['decrementCoord'](centerCoordinate, false);
            expect(newCoordinate).to.eql({ x: 8, y: 7 });
        });

        it('decrementCoord should return null if the coordinate passed as an argument is on the edge of the board vertically or horizontally', () => {
            const newCoordinateHorizontal = wordSolverService['decrementCoord'](upLeftCoordinate, true);
            const newCoordinateVertical = wordSolverService['decrementCoord'](upLeftCoordinate, false);
            expect(newCoordinateHorizontal && newCoordinateVertical).to.eql(null);
        });
    });

    context('buildPartialWord() Tests', () => {
        beforeEach(() => {
            gameboard.placeLetter({ x: 8, y: 8 }, 's');
        });

        it('should return empty string if coordinate passed as an argument is not occupied and isHorizontal is true or false', () => {
            wordSolverService['isHorizontal'] = true;
            const result1 = wordSolverService['buildPartialWord']({ x: 7, y: 7 });
            wordSolverService['isVertical'] = false;
            const result2 = wordSolverService['buildPartialWord']({ x: 7, y: 7 });
            expect(result1 && result2).to.eql('');
        });

        it('should return single string if coordinate passed as an argument is occupied and there is no adjacent letter', () => {
            wordSolverService['isHorizontal'] = true;
            const result1 = wordSolverService['buildPartialWord']({ x: 8, y: 8 });
            wordSolverService['isHorizontal'] = false;
            const result2 = wordSolverService['buildPartialWord']({ x: 8, y: 8 });
            expect(result1 && result2).to.eql('s');
        });

        it('should return correct string if there is adjacent letters horizontally', () => {
            gameboard.placeLetter({ x: 7, y: 8 }, 'e');
            gameboard.placeLetter({ x: 6, y: 8 }, 'l');
            wordSolverService['isHorizontal'] = true;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 });
            expect(result).to.eql('les');
        });

        it('should return correct string if there is adjacent letters vertically', () => {
            gameboard.placeLetter({ x: 8, y: 7 }, 'e');
            gameboard.placeLetter({ x: 8, y: 6 }, 'l');
            wordSolverService['isHorizontal'] = false;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 });
            expect(result).to.eql('les');
        });
    });

    context('getLimitNumber() Tests', () => {
        let anchorsList: LetterTile[];
        const NUMBER_5 = 5;
        beforeEach(() => {
            gameboard.placeLetter({ x: 5, y: 5 }, '');
            anchorsList = gameboard.findAnchors();
        });

        it('should return 0 if coordinate passed as an argument is occupied', () => {
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 5 }, anchorsList)).to.equal(0);
        });

        it('should return 0 if coordinate passed as an argument is an anchor', () => {
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 6 }, anchorsList)).to.equal(0);
        });

        it('should return correct number if there is no anchors or occupied tiles on the way and isHorizontal is true', () => {
            const expected = 8;
            wordSolverService['isHorizontal'] = true;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 1 }, anchorsList)).to.equal(expected);
        });

        it('should return correct number if there is no anchors or occupied tiles on the way and isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 3 }, anchorsList)).to.equal(3);
        });

        it('should return correct number if there is an anchor on the way and isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 4 }, anchorsList)).to.equal(3);
        });

        it('should return correct number if there is an anchor on the way and isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 11 }, anchorsList)).to.equal(NUMBER_5);
        });
    });

    context('crossCheck() Tests', () => {
        let result: Map<Coordinate, string[]>;
        beforeEach(() => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 3, y: 1 }, 'i');
            gameboard.placeLetter({ x: 4, y: 1 }, 'o');
            gameboard.placeLetter({ x: 5, y: 1 }, 'n');
        });

        it('result map should return correct list including letter v at (2, 1) position if isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            result = wordSolverService['crossCheck']();
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.contain('v');
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.not.contain('a');
        });

        it('result should return a list containing all alphabet letters at (2, 1) position if isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            result = wordSolverService['crossCheck']();
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.eql('abcdefghijklmnopqrstuvwxyz'.split(''));
        });

        it('result should return undefined at an occupied tile', () => {
            expect(result.get(gameboard.getLetterTile({ x: 5, y: 1 }).coordinate)).to.equal(undefined);
        });
    });

    context('verifyConditions() tests', () => {
        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 17, y: 1 };
            expect(wordSolverService['verifyConditions'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 1, y: 17 };
            expect(wordSolverService['verifyConditions'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return false if coordinate is placed on the gameboard', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, '');
            expect(wordSolverService['verifyConditions']({ x: 1, y: 1 })).to.equal(false);
        });

        it('should return true if coordinate is not placed on the gameboard', () => {
            expect(wordSolverService['verifyConditions']({ x: 1, y: 1 })).to.equal(true);
        });
    });

    context('extendRight() tests', () => {
        let rack: string[];
        let spyCreateCommand: Sinon.SinonSpy<[rack: string[]]>;

        beforeEach(() => {
            rack = ['p', 'e', 'u', 'r'];
            wordSolverService['isHorizontal'] = true;
            wordSolverService['crossCheckResults'] = wordSolverService['crossCheck']();
            spyCreateCommand = Sinon.spy(wordSolverService, 'createCommandInfo' as keyof WordSolverService);
        });
        it('createCommandInfo should be called if we could form a word with the rack letters', () => {
            const nextPosition: Coordinate = { x: 2, y: 2 };
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with rack and placed letters on the board', () => {
            const nextPosition: Coordinate = { x: 2, y: 2 };
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with blank letter and letters on the board', () => {
            rack = ['*'];
            const nextPosition: Coordinate = { x: 2, y: 2 };
            gameboard.placeLetter({ x: 2, y: 2 }, 'l');
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });
    });

    context('findLeftPart() tests', () => {
        it('should call findLeftPart() and extendRight() more than once if a word could be found', () => {
            const rack = ['l', 'e', 's'];
            const anchor: Coordinate = { x: 1, y: 1 };
            const limit = 100;
            const spyLeftPart = Sinon.spy(wordSolverService, 'findLeftPart' as keyof WordSolverService);
            const spyExtendRight = Sinon.spy(wordSolverService, 'extendRight' as keyof WordSolverService);
            wordSolverService['findLeftPart']('', wordSolverService['trie'].root, anchor, rack, limit);
            expect(spyLeftPart.callCount && spyExtendRight.callCount).to.be.greaterThan(1);
        });
    });

    it('createCommandInfo() should create correct commandInfo if there is placed letters on the board', () => {
        gameboard.placeLetter({ x: 2, y: 1 }, 'e');
        wordSolverService['isHorizontal'] = true;
        const expectedCommandInfo: CommandInfo = {
            firstCoordinate: { x: 1, y: 1 },
            isHorizontal: true,
            letters: ['t', 's', 't'],
        };
        wordSolverService['createCommandInfo']('test', { x: 4, y: 1 });
        expect(wordSolverService['commandInfoList'][0]).to.deep.equal(expectedCommandInfo);
    });

    // context('findOptions() tests', () => {
    //     let anchors: Coordinate[];
    //     let rack: string[];
    //     beforeEach(() => {
    //         rack = ['s'];
    //         anchors = [{ x: 1, y: 1 }, { x: 5, y: 5 }];
    //         gameboard.placeLetter(new LetterTile(5, 5, { value: 'e' } as Letter));
    //         gameboard.placeLetter(new LetterTile(4, 5, { value: 'l' } as Letter));
    //     });

    //     it('should create correct commandInfos');
    // });
});
