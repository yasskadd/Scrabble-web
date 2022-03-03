/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Gameboard } from '@app/classes/gameboard.class';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import { BoxMultiplierService } from './box-multiplier.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordSolverService } from './word-solver.service';

describe.only('Word solver service', () => {
    let wordSolverService: WordSolverService;
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;

    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        dictionaryValidationService.createTrieDictionary();
        boxMultiplierService = new BoxMultiplierService();
        gameboard = new Gameboard(boxMultiplierService);
        wordSolverService = new WordSolverService(dictionaryValidationService.trie, gameboard);
    });

    it.only('test', () => {
        const rack: string[] = ['t', 'a'];
        gameboard.placeLetter(new LetterTile(7, 8, { value: 't' } as Letter));
        gameboard.placeLetter(new LetterTile(8, 8, { value: 'e' } as Letter));
        wordSolverService.findAllOptions(rack);
        wordSolverService.commandInfoScore(wordSolverService['commandInfoList']);
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
            expect(newCoordinateHorizontal && newCoordinateVertical).to.be.null;
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
            expect(newCoordinateHorizontal && newCoordinateVertical).to.be.null;
        });
    });

    context('buildPartialWord() Tests', () => {
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(8, 8, { value: 's' } as Letter));
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
            gameboard.placeLetter(new LetterTile(7, 8, { value: 'e' } as Letter));
            gameboard.placeLetter(new LetterTile(6, 8, { value: 'l' } as Letter));
            wordSolverService['isHorizontal'] = true;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            expect(result).to.eql('les');
        });

        it('should return correct string if there is adjacent letters vertically', () => {
            gameboard.placeLetter(new LetterTile(8, 7, { value: 'e' } as Letter));
            gameboard.placeLetter(new LetterTile(8, 6, { value: 'l' } as Letter));
            wordSolverService['isHorizontal'] = false;
            const result = wordSolverService['buildPartialWord']({ x: 8, y: 8 } as Coordinate);
            expect(result).to.eql('les');
        });
    });

    context('getLimitNumber() Tests', () => {
        let anchorsList: LetterTile[];
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(5, 5, {} as Letter));
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
            expect(wordSolverService['getLimitNumber']({ x: 8, y: 1 } as Coordinate, anchorsList)).to.equal(8);
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
            expect(wordSolverService['getLimitNumber']({ x: 5, y: 11 } as Coordinate, anchorsList)).to.equal(5);
        });
    });

    context('crossCheck() Tests', () => {
        let result: Map<Coordinate, string[]>;
        beforeEach(() => {
            gameboard.placeLetter(new LetterTile(1, 1, { value: 'a' } as Letter));
            gameboard.placeLetter(new LetterTile(3, 1, { value: 'i' } as Letter));
            gameboard.placeLetter(new LetterTile(4, 1, { value: 'o' } as Letter));
            gameboard.placeLetter(new LetterTile(5, 1, { value: 'n' } as Letter));
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
            expect(result.get(gameboard.getCoord(new LetterTile(5, 1, { value: 'n' } as Letter)))).to.equal(undefined);
        });
    });

    // context('extendRight() Tests', () => {
    //     let firstNode: LetterTreeNode;
    //     let rack: string[];
    //     beforeEach(() => {
    //         firstNode = dictionaryValidationService.trie.root;
    //         rack = ['l', 'l', 'e', 'a', 'p', 'i', 'o'];
    //     });

    //     it('should call itself', () => {
    //         const spyExtend = Sinon.spy(wordSolverService, 'extendRight' as never)
    //         const mock = Sinon.mock(wordSolverService);
    //         mock.
    //         expect(spyExtend.)
    //     });

    //     it('should call findLeftPart()', () => {

    //     })
    // });
});
