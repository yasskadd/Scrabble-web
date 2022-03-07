/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTile } from '@app/classes/letter-tile.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';
import { LetterPlacementService } from './letter-placement.service';

describe('Letter Placement Service', () => {
    let player: Player;
    let commandInfo: CommandInfo;
    let letterA: Letter;
    let letterB: Letter;
    let letterC: Letter;
    let gameboard: Gameboard;
    let placementService: LetterPlacementService;
    let dictionaryValidation: Sinon.SinonStubbedInstance<DictionaryValidationService>;

    beforeEach(() => {
        letterA = { value: 'a', points: 1 } as Letter;
        letterB = { value: 'b', points: 2 } as Letter;
        letterC = { value: 'c', points: 3 } as Letter;

        player = { rack: [letterA, letterB], score: 0, name: 'test', room: 'testRoom' } as Player;
        commandInfo = {
            firstCoordinate: { x: 1, y: 1 },
            isHorizontal: true,
            letters: ['a', 'l', 'l'],
        };

        gameboard = new Gameboard();
        dictionaryValidation = Sinon.createStubInstance(DictionaryValidationService);
        placementService = new LetterPlacementService(dictionaryValidation as unknown as DictionaryValidationService);
    });

    context('validateCommandCoordinate() tests', () => {
        it('validateCommandCoordinate() should return false if letterCoords list is empty and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({} as Coordinate, gameboard)).to.equal(false);
        });

        it('validateCommandCoordinate() should return true if coord is valid and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({ x: 1, y: 1 }, gameboard)).to.equal(false);
        });

        it('validateCommandCoordinate() should return false if coord is outOfBounds and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({ x: 0, y: 1 }, gameboard)).to.equal(false);
        });

        it('validateCommandCoordinate() should return false if coord is outOfBounds and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({ x: 1, y: 0 }, gameboard)).to.equal(false);
        });

        it('validateCommandCoordinate() should return false if coord is outOfBounds and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({ x: 0, y: 0 }, gameboard)).to.equal(false);
        });

        it('validateCommandCoordinate() should return false if coord already isOccupied on board', () => {
            gameboard.placeLetter({ x: 0, y: 0 }, 'a');
            expect(placementService['validateCommandCoordinate']({ x: 0, y: 0 }, gameboard)).to.equal(false);
        });
    });

    context('areLettersInRack() tests', () => {
        it('areLettersInRack() should return true if letter is in rack', () => {});

        it('areLettersInRack() should return false if letter is not in rack', () => {});

        it('return a list of letters', () => {
            const letters: LetterTile[] = [new LetterTile(1, 1, letterA)];
            expect(placementService['associateLettersWithRack'](letters, player).length).to.eql(letters.length);
        });

        it('return empty list if letters are not in the rack', () => {
            const letters: LetterTile[] = [new LetterTile(1, 1, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
        });

        it('return empty list if not every letters match the rack', () => {
            const letters: LetterTile[] = [new LetterTile(1, 1, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
        });

        it('should set isBlank attribute to true and points to 0 if letter i uppercase', () => {
            const letters: LetterTile[] = [new LetterTile(0, 0, { value: 'C', points: 1 } as Letter)];
            placementService['associateLettersWithRack'](letters, player);
            expect(letters[0].letter.isBlankLetter).to.equal(true);
            expect(letters[0].letter.points).to.equal(0);
        });

        it('should return false if lettersCoords do not match the player rack', () => {
            const letterCoords: LetterTile[] = [new LetterTile(2, 2, letterC), new LetterTile(1, 1, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if there is only one letter not matching the player rack', () => {
            const letterCoords: LetterTile[] = [new LetterTile(2, 2, letterA), new LetterTile(1, 1, letterB), new LetterTile(1, 1, letterC)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if player rack is empty', () => {
            player.rack = [];
            const letterCoords: LetterTile[] = [new LetterTile(1, 1, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if there is 2 times the same letter in letterCoords but only once in player rack', () => {
            const letterCoords: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 2, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return true if all lettersCoords match exactly the player rack', () => {
            const letterCoords: LetterTile[] = [new LetterTile(2, 2, letterA), new LetterTile(1, 1, letterB)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(true);
        });

        it('should return true if all the letterCoords are in the player rack but dont match exactly', () => {
            const letterCoords: LetterTile[] = [new LetterTile(2, 2, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(true);
        });
    });

    it('should return deep copy of playerRack', () => {
        // eslint-disable-next-line dot-notation
        const copyRack = placementService['createTempRack'](player);
        expect(copyRack).to.not.equal(player.rack);
        expect(copyRack).to.deep.equal(player.rack);
    });

    context('verifyFirstTurn() tests', () => {
        it('should return true if gameboard has no placed letters and letterCoords include middle coordinate', () => {
            const word = new Word(
                {
                    firstCoordinate: { x: 8, y: 8 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );
            const allUnoccupied = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allUnoccupied).to.equal(true);
            expect(placementService['verifyFirstTurn'](word.wordCoords, gameboard)).to.equal(true);
        });

        it('should return true if gameboard has no placed letters and letterCoords do not include middle coordinate', () => {
            const word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );
            const allUnoccupied = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allUnoccupied).to.equal(true);
            expect(placementService['verifyFirstTurn'](word.wordCoords, gameboard)).to.equal(false);
        });

        it('should return true if gameboard has no placed letters and letterCoords includes middle coordinate', () => {
            const letterCoords: LetterTile[] = [new LetterTile(8, 8, letterA), new LetterTile(8, 9, letterB)];
            const allEqual = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(true);
        });

        it('should return true if there is placed letters on the gameboard', () => {
            const letterCoords: LetterTile[] = [new LetterTile(8, 8, letterA), new LetterTile(8, 9, letterB)];
            gameboard.placeLetters(new LetterTile(1, 1, {} as Letter));
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(true);
        });
    });

    context('globalCommandVerification() tests', () => {
        let getLettersStub: Sinon.SinonStub<unknown[], unknown>;
        let isPlacementStub: Sinon.SinonStub<unknown[], unknown>;
        let lettersInRackStub: Sinon.SinonStub<unknown[], unknown>;
        let invalidFirstPlacementStub: Sinon.SinonStub<unknown[], unknown>;
        let letterCoords: LetterTile[];
        beforeEach(() => {
            getLettersStub = Sinon.stub(placementService, 'getLettersCoord' as never);
            isPlacementStub = Sinon.stub(placementService, 'isPlacementValid' as never);
            lettersInRackStub = Sinon.stub(placementService, 'areLettersInRack' as never);
            invalidFirstPlacementStub = Sinon.stub(placementService, 'verifyFirstTurn' as never);
            letterCoords = [new LetterTile(0, 0, letterA), new LetterTile(0, 1, letterB)];
            getLettersStub.returns(letterCoords);
        });

        afterEach(() => {
            getLettersStub.restore();
            isPlacementStub.restore();
            lettersInRackStub.restore();
            invalidFirstPlacementStub.restore();
        });

        it('should return array with letterCoords and invalidPlacement string if isPlacement() returns false', () => {
            isPlacementStub.withArgs(commandInfo, gameboard).returns(false);
            const expectedReturn = [letterCoords, 'Placement invalide'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with letterCoords and lettersNotInRack string if areLettersInRack() returns false', () => {
            isPlacementStub.returns(true);
            lettersInRackStub.returns(false);
            const expectedReturn = [letterCoords, 'Lettres absents du chevalet'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return letterCoords and invalidFirstPlacement string if verifyFirstTurn() returns false', () => {
            isPlacementStub.returns(true);
            lettersInRackStub.returns(true);
            invalidFirstPlacementStub.returns(false);
            const expectedReturn = [letterCoords, 'Placement du premier tour pas valide'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return letterCoords and null if verification is valid', () => {
            isPlacementStub.returns(true);
            lettersInRackStub.returns(true);
            invalidFirstPlacementStub.returns(true);
            const expectedReturn = [letterCoords, null];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });
    });

    context('placeLetters tests', () => {
        let letterCoords: LetterTile[];
        const bonusPoint = 50;
        const points = 10;
        beforeEach(() => {
            commandInfo = {};
        });

        it('should call validateWords() once', () => {
            placementService.placeLetters(letterCoords, player, gameboard);
            expect(dictionaryValidation.validateWords.calledOnce).to.equal(true);
        });

        it('should return false and the gameboard if validateWords returns 0', () => {
            dictionaryValidation.validateWords.returns(0);
            expect(placementService.placeLetters(letterCoords, player, gameboard)).to.eql([false, gameboard]);
        });

        it('should change player score if validateWords() dont return 0', () => {
            letterCoords = [new LetterTile(1, 1, letterA)];
            dictionaryValidation.validateWords.returns(points);
            placementService.placeLetters(letterCoords, player, gameboard);
            expect(player.score).to.equal(points);
        });

        it('should return true and gameboard if validateWords() dont return 0', () => {
            dictionaryValidation.validateWords.returns(points);
            expect(placementService.placeLetters(letterCoords, player, gameboard)).to.eql([true, gameboard]);
        });

        it('should give a bonus of 50 points', () => {
            dictionaryValidation.validateWords.returns(points);
            placementService.placeLetters(letterCoords, player, gameboard);
            expect(player.score).to.equal(points + bonusPoint);
        });
    });
});
