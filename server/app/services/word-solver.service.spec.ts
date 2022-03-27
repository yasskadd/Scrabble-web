/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@common/interfaces/command-info';
import { Coordinate } from '@common/interfaces/coordinate';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordSolverService } from './word-solver.service';

describe('Word solver service', () => {
    let wordSolverService: WordSolverService;
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;
    let spyFindBeforePart: Sinon.SinonSpy;

    before(() => {
        dictionaryValidationService = new DictionaryValidationService();
        dictionaryValidationService.createTrieDictionary();
    });

    beforeEach(() => {
        wordSolverService = new WordSolverService(dictionaryValidationService);
        gameboard = new Gameboard();
        wordSolverService['gameboard'] = gameboard;
        spyFindBeforePart = Sinon.spy(wordSolverService, 'findWordPartBeforeAnchor' as keyof WordSolverService);
    });

    it('findAllOptions should not call extendWordAfterAnchor() if partialWordNode is null', () => {
        const rack: string[] = ['l'];
        const spyExtendAfter = Sinon.spy(wordSolverService, 'extendWordAfterAnchor' as never);
        const stubPartialWordNode = Sinon.stub(wordSolverService, 'buildPartialWord' as never);
        stubPartialWordNode.returns('notInTrie');
        gameboard.placeLetter({ x: 8, y: 8 } as Coordinate, 'e');
        wordSolverService.findAllOptions(rack);
        expect(spyExtendAfter.calledWith('notInTrie')).to.be.equal(false);
    });

    it('setGameboard should set the gameboard attribute of the service', () => {
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
        let anchorsList: Coordinate[];
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

    context('findLettersForBoardTiles() Tests', () => {
        let result: Map<Coordinate, string[]>;
        beforeEach(() => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            gameboard.placeLetter({ x: 3, y: 1 }, 'i');
            gameboard.placeLetter({ x: 4, y: 1 }, 'o');
            gameboard.placeLetter({ x: 5, y: 1 }, 'n');
        });

        it('result map should return correct list including letter v at (2, 1) position if isHorizontal is false', () => {
            wordSolverService['isHorizontal'] = false;
            result = wordSolverService['findLettersForBoardTiles']();
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.contain('v');
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.not.contain('a');
        });

        it('result should return a list containing all alphabet letters at (2, 1) position if isHorizontal is true', () => {
            wordSolverService['isHorizontal'] = true;
            result = wordSolverService['findLettersForBoardTiles']();
            expect(result.get(gameboard.getLetterTile({ x: 2, y: 1 }).coordinate)).to.eql('abcdefghijklmnopqrstuvwxyz'.split(''));
        });

        it('result should return undefined at an occupied tile', () => {
            expect(result.get(gameboard.getLetterTile({ x: 5, y: 1 }).coordinate)).to.equal(undefined);
        });
    });

    context('isOutOfBoundsOrIsOccupied() tests', () => {
        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 17, y: 1 };
            expect(wordSolverService['isOutOfBoundsOrIsOccupied'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return true if the coordinate is out of bounds horizontally', () => {
            const outOfBoundsCoord: Coordinate = { x: 1, y: 17 };
            expect(wordSolverService['isOutOfBoundsOrIsOccupied'](outOfBoundsCoord)).to.equal(true);
        });

        it('should return false if coordinate is placed on the gameboard', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, '');
            expect(wordSolverService['isOutOfBoundsOrIsOccupied']({ x: 1, y: 1 })).to.equal(false);
        });

        it('should return true if coordinate is not placed on the gameboard', () => {
            expect(wordSolverService['isOutOfBoundsOrIsOccupied']({ x: 1, y: 1 })).to.equal(true);
        });
    });

    context('extendWordAfterAnchor() tests', () => {
        let spyCreateCommand: Sinon.SinonSpy<[rack: string[]]>;

        beforeEach(() => {
            wordSolverService['rack'] = ['p', 'e', 'u', 'r'];
            wordSolverService['isHorizontal'] = true;
            wordSolverService['legalLetterForBoardTiles'] = wordSolverService['findLettersForBoardTiles']();
            spyCreateCommand = Sinon.spy(wordSolverService, 'createCommandInfo' as keyof WordSolverService);
        });

        it('createCommandInfo should be called if we could form a word with the rack letters', () => {
            const nextPosition: Coordinate = { x: 2, y: 2 };
            wordSolverService['extendWordAfterAnchor']('', wordSolverService['trie'].root, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with rack and placed letters on the board', () => {
            const nextPosition: Coordinate = { x: 2, y: 2 };
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');
            wordSolverService['extendWordAfterAnchor']('', wordSolverService['trie'].root, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('createCommandInfo should be called if we could form a word with blank letter and letters on the board', () => {
            wordSolverService['rack'] = ['*'];
            const nextPosition: Coordinate = { x: 2, y: 2 };
            gameboard.placeLetter({ x: 2, y: 2 }, 'l');
            wordSolverService['extendWordAfterAnchor']('', wordSolverService['trie'].root, nextPosition, false);
            expect(spyCreateCommand.called).to.equal(true);
        });

        it('should not call addRackLetterToPartialWord() or addBoardLetterToPartialWord() if nextPosition is null', () => {
            const spyAddRackLetterToWord = Sinon.spy(wordSolverService, 'addRackLetterToPartialWord' as never);
            const spyBoardLetterToWord = Sinon.spy(wordSolverService, 'addBoardLetterToPartialWord' as never);
            wordSolverService['extendWordAfterAnchor']('', wordSolverService['trie'].root, null as never, false);
            expect(spyAddRackLetterToWord.called && spyBoardLetterToWord.called).to.be.equal(false);
        });
    });

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

    context('findWordPartBeforeAnchor() tests', () => {
        it('should call findWordPartBeforeAnchor() and extendWordAfterAnchor() more than once if a word could be found', () => {
            wordSolverService['rack'] = ['l', 'e', 's'];
            const anchor: Coordinate = { x: 1, y: 1 };
            const limit = 100;
            const spyExtendWordAfterAnchor = Sinon.spy(wordSolverService, 'extendWordAfterAnchor' as keyof WordSolverService);
            wordSolverService['findWordPartBeforeAnchor']('', wordSolverService['trie'].root, anchor, limit);
            expect(spyFindBeforePart.callCount && spyExtendWordAfterAnchor.callCount).to.be.greaterThan(1);
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

    it('firstTurnOrEmpty() should not call findWordPartBeforeAnchor if there is placed letters on board', () => {
        wordSolverService['rack'] = ['t', 'e', 's', 't'];
        wordSolverService['gameboard'].placeLetter({ x: 1, y: 1 } as Coordinate, 'a');
        wordSolverService['anchors'] = wordSolverService['gameboard'].findAnchors();
        wordSolverService['firstTurnOrEmpty']();
        expect(spyFindBeforePart.called).to.be.equal(false);
    });

    it('firstTurnOrEmpty() should call findWordPartBeforeAnchor if there is no placed letters on board', () => {
        wordSolverService['anchors'] = wordSolverService['gameboard'].findAnchors();
        const MAX_LETTERS_LIMIT = 7;
        wordSolverService['rack'] = ['t', 'e', 's', 't'];
        wordSolverService['firstTurnOrEmpty']();
        expect(
            spyFindBeforePart.firstCall.calledWith('', wordSolverService['trie'].root, { x: 8, y: 8 } as Coordinate, MAX_LETTERS_LIMIT),
        ).to.be.equal(true);
    });

    context('CommandInfoScore() Tests', () => {
        it('should return an empty Map if commandInfoList passed as parameter is empty', () => {
            const mapResult: Map<CommandInfo, number> = wordSolverService.commandInfoScore([]);
            expect(mapResult.size).to.be.equal(0);
        });

        it('should associate each commandInfo to points score in the map', () => {
            wordSolverService['rack'] = ['a', 'l', 'l'];
            gameboard.placeLetter({ x: 8, y: 8 } as Coordinate, 'e');
            gameboard.placeLetter({ x: 5, y: 5 } as Coordinate, 'o');
            const mapResult: Map<CommandInfo, number> = wordSolverService.commandInfoScore(
                wordSolverService.findAllOptions(wordSolverService['rack']),
            );
            mapResult.forEach((value) => {
                expect(value).to.be.greaterThan(0);
            });
        });
    });
});
