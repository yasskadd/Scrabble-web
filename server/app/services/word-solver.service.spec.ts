/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Coordinate } from '@common/interfaces/coordinate';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { BoxMultiplierService } from './box-multiplier.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordSolverService } from './word-solver.service';

describe('Word solver service', () => {
    let wordSolverService: WordSolverService;
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplierService>;
    const NUMBER_7 = 7;
    const NUMBER_8 = 8;
    const NUMBER_10 = 10;
    const NUMBER_12 = 12;
    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        dictionaryValidationService.createTrieDictionary();
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
        wordSolverService = new WordSolverService();
        wordSolverService['gameboard'] = gameboard;
    });

    // TODO: Temporary test, need modifications
    it('should find all options', () => {
        const rack: string[] = ['*'];
        gameboard.placeLetter(new LetterTile(1, NUMBER_12, { value: 'z' } as Letter));
        gameboard.placeLetter(new LetterTile(2, 1, { value: 'l' } as Letter));
        gameboard.placeLetter(new LetterTile(NUMBER_7, NUMBER_10, { value: 'a' } as Letter));
        gameboard.placeLetter(new LetterTile(NUMBER_7, NUMBER_8, { value: 'j' } as Letter));
        gameboard.placeLetter(new LetterTile(NUMBER_8, NUMBER_8, { value: 'e' } as Letter));
        wordSolverService.findAllOptions(rack);
        expect(wordSolverService.commandInfoScore(wordSolverService['commandInfoList']).size).to.be.greaterThan(1);
    });

    it(' setGameboard should set the gameboard attribute of the service', () => {
        const gameboardStub = new Gameboard(boxMultiplierService);
        gameboardStub.placeLetter(new LetterTile(1, NUMBER_12, { value: 'z' } as Letter));
        gameboardStub.placeLetter(new LetterTile(2, 1, { value: 'x' } as Letter));
        gameboardStub.placeLetter(new LetterTile(2, 1, { value: 'l' } as Letter));
        gameboardStub.placeLetter(new LetterTile(NUMBER_7, NUMBER_10, { value: 'a' } as Letter));
        wordSolverService.setGameboard(gameboardStub);
        expect(wordSolverService['gameboard']).to.equal(gameboardStub);
    });

    context('Coordinate manipulation tests', () => {
        let upLeftCoordinate: Coordinate;
        let downRightCoordinate: Coordinate;
        let centerCoordinate: Coordinate;
        beforeEach(() => {
            upLeftCoordinate = { x: 1, y: 1 } as Coordinate;
            downRightCoordinate = { x: 15, y: 15 } as Coordinate;
            centerCoordinate = { x: 8, y: 8 } as Coordinate;
        });

        it('incrementCoord should return a new Coordinate with x incremented if isHorizontal is true', () => {
            const newCoordinate = wordSolverService['incrementCoord'](centerCoordinate, true);
            expect(newCoordinate).to.eql({ x: 9, y: 8 } as Coordinate);
        });

        it('incrementCoord should return a new Coordinate with y incremented if isHorizontal is false', () => {
            const newCoordinate = wordSolverService['incrementCoord'](centerCoordinate, false);
            expect(newCoordinate).to.eql({ x: 8, y: 9 } as Coordinate);
        });

        it('incrementCoord should return null if the coordinate passed as an argument is on the edge of the board vertically or horizontally', () => {
            const newCoordinateHorizontal = wordSolverService['incrementCoord'](downRightCoordinate, true);
            const newCoordinateVertical = wordSolverService['incrementCoord'](downRightCoordinate, false);
            expect(newCoordinateHorizontal && newCoordinateVertical).to.eql(null);
        });

        it('decrementCoord should return a newCoordinate with x decremented if isHorizontal is true', () => {
            const newCoordinate = wordSolverService['decrementCoord'](centerCoordinate, true);
            expect(newCoordinate).to.eql({ x: 7, y: 8 } as Coordinate);
        });

        it('decrementCoord should return a newCoordinate with y decremented if isHorizontal is false', () => {
            const newCoordinate = wordSolverService['decrementCoord'](centerCoordinate, false);
            expect(newCoordinate).to.eql({ x: 8, y: 7 } as Coordinate);
        });

        it('decrementCoord should return null if the coordinate passed as an argument is on the edge of the board vertically or horizontally', () => {
            const newCoordinateHorizontal = wordSolverService['decrementCoord'](upLeftCoordinate, true);
            const newCoordinateVertical = wordSolverService['decrementCoord'](upLeftCoordinate, false);
            expect(newCoordinateHorizontal && newCoordinateVertical).to.eql(null);
        });
    });

    context('buildPartialWord() Tests', () => {
        const NUMBER_6 = 6;
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(NUMBER_8, NUMBER_8, { value: 's' } as Letter));
        });

        it('should return empty string if coordinate passed as an argument is not occupied and isHorizontal is true or false', () => {
            wordSolverService['isHorizontal'] = true;
            const result1 = wordSolverService['buildPartialWord']({ x: 7, y: 7 } as Coordinate);
            wordSolverService['isVertical'] = false;
            const result2 = wordSolverService['buildPartialWord']({ x: 7, y: 7 } as Coordinate);
            expect(result1 && result2).to.eql('');
        });

        it('should return single string if coordinate passed as an argument is occupied and there is no adjacent letter', () => {
            wordSolverService['isHorizontal'] = true;
            const result1 = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            wordSolverService['isHorizontal'] = false;
            const result2 = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            expect(result1 && result2).to.eql('s');
        });

        it('should return correct string if there is adjacent letters horizontally', () => {
            gameboard.placeLetter(new LetterTile(NUMBER_7, NUMBER_8, { value: 'e' } as Letter));
            gameboard.placeLetter(new LetterTile(NUMBER_6, NUMBER_8, { value: 'l' } as Letter));
            wordSolverService['isHorizontal'] = true;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            expect(result).to.eql('les');
        });

        it('should return correct string if there is adjacent letters vertically', () => {
            gameboard.placeLetter(new LetterTile(NUMBER_8, NUMBER_7, { value: 'e' } as Letter));
            gameboard.placeLetter(new LetterTile(NUMBER_8, NUMBER_6, { value: 'l' } as Letter));
            wordSolverService['isHorizontal'] = false;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            expect(result).to.eql('les');
        });
    });

    context('getLimitNumber() Tests', () => {
        let anchorsList: LetterTile[];
        const NUMBER_5 = 5;
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(NUMBER_5, NUMBER_5, {} as Letter));
            anchorsList = gameboard.findAnchors();
        });

        it('should return 0 if coordinate passed as an argument is occupied', () => {
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 5 } as Coordinate, anchorsList)).to.equal(0);
        });

        it('should return 0 if coordinate passed as an argument is an anchor', () => {
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 6 } as Coordinate, anchorsList)).to.equal(0);
        });

        it('should return correct number if there is no anchors or occupied tiles on the way and isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 1 } as Coordinate, anchorsList)).to.equal(NUMBER_8);
        });

        it('should return correct number if there is no anchors or occupied tiles on the way and isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 3 } as Coordinate, anchorsList)).to.equal(3);
        });

        it('should return correct number if there is an anchor on the way and isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 4 } as Coordinate, anchorsList)).to.equal(3);
        });

        it('should return correct number if there is an anchor on the way and isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 11 } as Coordinate, anchorsList)).to.equal(NUMBER_5);
        });
    });

    context('crossCheck() Tests', () => {
        let result: Map<Coordinate, string[]>;
        const NUMBER_4 = 4;
        const NUMBER_5 = 5;
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(1, 1, { value: 'a' } as Letter));
            gameboard.placeLetter(new LetterTile(3, 1, { value: 'i' } as Letter));
            gameboard.placeLetter(new LetterTile(NUMBER_4, 1, { value: 'o' } as Letter));
            gameboard.placeLetter(new LetterTile(NUMBER_5, 1, { value: 'n' } as Letter));
        });

        it('result map should return correct list including letter v at (2, 1) position if isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            result = wordSolverService['crossCheck']();
            expect(result.get(gameboard.getCoord({ x: 2, y: 1 } as Coordinate))).to.contain('v');
            expect(result.get(gameboard.getCoord({ x: 2, y: 1 } as Coordinate))).to.not.contain('a');
        });

        it('result should return a list containing all alphabet letters at (2, 1) position if isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            result = wordSolverService['crossCheck']();
            expect(result.get(gameboard.getCoord({ x: 2, y: 1 } as Coordinate))).to.eql('abcdefghijklmnopqrstuvwxyz'.split(''));
        });

        it('result should return undefined at an occupied tile', () => {
            expect(result.get(gameboard.getCoord(new LetterTile(NUMBER_5, 1, { value: 'n' } as Letter)))).to.equal(undefined);
        });
    });

    context('verifyConditions() tests', () => {
        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 17, y: 1 } as Coordinate;
            expect(wordSolverService['verifyConditions'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 1, y: 17 } as Coordinate;
            expect(wordSolverService['verifyConditions'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return false if coordinate is placed on the gameboard', () => {
            gameboard.placeLetter(new LetterTile(1, 1, {} as Letter));
            expect(wordSolverService['verifyConditions']({ x: 1, y: 1 } as Coordinate)).to.equal(false);
        });

        it('should return true if coordinate is not placed on the gameboard', () => {
            expect(wordSolverService['verifyConditions']({ x: 1, y: 1 } as Coordinate)).to.equal(true);
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
            const nextPosition: Coordinate = { x: 2, y: 2 } as Coordinate;
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with rack and placed letters on the board', () => {
            const nextPosition: Coordinate = { x: 2, y: 2 } as Coordinate;
            gameboard.placeLetter(new LetterTile(3, 2, { value: 'a' } as Letter));
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with blank letter and letters on the board', () => {
            rack = ['*'];
            const nextPosition: Coordinate = { x: 2, y: 2 } as Coordinate;
            gameboard.placeLetter(new LetterTile(2, 2, { value: 'l' } as Letter));
            wordSolverService['extendRight']('', wordSolverService['trie'].root, rack, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });
    });

    context('findLeftPart() tests', () => {
        it('should call findLeftPart() and extendRight() more than once if a word could be found', () => {
            const rack = ['l', 'e', 's'];
            const anchor: Coordinate = { x: 1, y: 1 } as Coordinate;
            const limit = 100;
            const spyLeftPart = Sinon.spy(wordSolverService, 'findLeftPart' as keyof WordSolverService);
            const spyExtendRight = Sinon.spy(wordSolverService, 'extendRight' as keyof WordSolverService);
            wordSolverService['findLeftPart']('', wordSolverService['trie'].root, anchor, rack, limit);
            expect(spyLeftPart.callCount && spyExtendRight.callCount).to.be.greaterThan(1);
        });
    });

    it('createCommandInfo() should create correct commandInfo if there is placed letters on the board', () => {
        gameboard.placeLetter(new LetterTile(2, 1, { value: 'e' } as Letter));
        wordSolverService['isHorizontal'] = true;
        const expectedCommandInfo: CommandInfo = {
            firstCoordinate: gameboard.getCoord({ x: 1, y: 1 } as Coordinate),
            direction: 'h',
            lettersPlaced: ['t', 's', 't'],
        };
        wordSolverService['createCommandInfo']('test', { x: 4, y: 1 } as Coordinate);
        expect(wordSolverService['commandInfoList'][0]).to.deep.equal(expectedCommandInfo);
    });

    // context('findOptions() tests', () => {
    //     let anchors: Coordinate[];
    //     let rack: string[];
    //     beforeEach(() => {
    //         rack = ['s'];
    //         anchors = [{ x: 1, y: 1 } as Coordinate, { x: 5, y: 5 } as Coordinate];
    //         gameboard.placeLetter(new LetterTile(5, 5, { value: 'e' } as Letter));
    //         gameboard.placeLetter(new LetterTile(4, 5, { value: 'l' } as Letter));
    //     });

    //     it('should create correct commandInfos');
    // });
});
