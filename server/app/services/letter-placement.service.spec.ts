/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { CommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { BoxMultiplierService } from './box-multiplier.service';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { LetterPlacementService } from './letter-placement.service';
import { WordFinderService } from './word-finder.service';

describe('Letter Placement Service', () => {
    // Should we stub gameboard ???
    let player: Player;
    let commandInfo: CommandInfo;
    let letterA: Letter;
    let letterB: Letter;
    let letterC: Letter;
    let gameboard: Gameboard;
    let placementService: LetterPlacementService;
    // let gameboardCoordValidation: Sinon.SinonStubbedInstance<GameboardCoordinateValidationService>;
    let validateCoordService: Sinon.SinonStubbedInstance<GameboardCoordinateValidationService>;
    let wordFinderService: Sinon.SinonStubbedInstance<WordFinderService>;
    let dictionaryValidation: Sinon.SinonStubbedInstance<DictionaryValidationService>;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplierService>;

    beforeEach(() => {
        letterA = { value: 'a', points: 1 } as Letter;
        letterB = { value: 'b', points: 2 } as Letter;
        letterC = { value: 'c', points: 3 } as Letter;

        player = { rack: [letterA, letterB], score: 0, name: 'test', room: 'testRoom' } as Player;
        commandInfo = {
            firstCoordinate: { x: 1, y: 1 } as LetterTile,
            direction: 'h',
            lettersPlaced: ['a', 'l', 'l'],
        } as CommandInfo;

        wordFinderService = Sinon.createStubInstance(WordFinderService);
        validateCoordService = Sinon.createStubInstance(GameboardCoordinateValidationService);
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplierService);
        dictionaryValidation = Sinon.createStubInstance(DictionaryValidationService);
        gameboard = new Gameboard(boxMultiplierService);
        // gameboardCoordValidation = Sinon.createStubInstance(GameboardCoordinateValidationService);
        placementService = new LetterPlacementService(
            validateCoordService as unknown as GameboardCoordinateValidationService,
            wordFinderService as unknown as WordFinderService,
            dictionaryValidation as unknown as DictionaryValidationService,
        );
    });

    afterEach(() => {
        validateCoordService.validateGameboardCoordinate.restore();
    });

    it('getLettersCoord() should call validateGameboardCoordinate()', () => {
        placementService['getLettersCoord'](commandInfo, gameboard);
        expect(validateCoordService.validateGameboardCoordinate.calledOnce).to.equal(true);
    });

    it('getLettersCoord() should return correct game Coordinates', () => {
        const expectedCoords = [new LetterTile(4, 4, letterA), new LetterTile(5, 4, letterB)];
        validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns(expectedCoords);
        const letterCoords = placementService['getLettersCoord'](commandInfo, gameboard);
        expect(letterCoords).to.equal(expectedCoords);
    });

    it('isPlacementValid should return false if letterCoords list is empty', () => {
        const letterCoords: LetterTile[] = [];
        expect(placementService['isPlacementValid'](letterCoords)).to.equal(false);
    });

    it('isPlacementValid should return true if letterCoords list is not empty', () => {
        const letterCoords: LetterTile[] = [new LetterTile(1, 1, letterA)];
        expect(placementService['isPlacementValid'](letterCoords)).to.equal(true);
    });

    it('should return deep copy of playerRack', () => {
        // eslint-disable-next-line dot-notation
        const copyRack = placementService['createTempRack'](player);
        expect(copyRack).to.not.equal(player.rack);
        expect(copyRack).to.deep.equal(player.rack);
    });

    context('associateLettersWithRack tests', () => {
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
    });

    context('createLetterPoints tests', () => {
        let placedLettersCoords: LetterTile[];
        let lettersPlaced: Letter[];

        beforeEach(() => {
            placedLettersCoords = [
                new LetterTile(1, 1, { value: 'a' } as Letter),
                new LetterTile(1, 2, { value: 'b' } as Letter),
                new LetterTile(1, 3, { value: 'b' } as Letter),
            ];
            lettersPlaced = [letterA, letterB];
        });

        it('should return a list of LetterTile with correct points', () => {
            const newPlacedLettersCoords = placementService['createLetterPoints'](placedLettersCoords, lettersPlaced as Letter[]);
            const expectedLetters: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterB)];
            expect(newPlacedLettersCoords).to.eql(expectedLetters);
        });

        it('should return an empty list if no placed letter coord match the letter placed', () => {
            placedLettersCoords = [new LetterTile(1, 1, { value: 'c' } as Letter)];
            expect(placementService['createLetterPoints'](placedLettersCoords, lettersPlaced)).to.eql([]);
        });
    });

    context('areLettersInRack() tests', () => {
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

    context('verifyFirstTurn tests', () => {
        it('should return false if gameboard has no placed letters and letterCoords do not include middle coordinate', () => {
            const letterCoords: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB)];
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(false);
        });

        it('should return true if gameboard has no placed letters and letterCoords includes middle coordinate', () => {
            const letterCoords: LetterTile[] = [new LetterTile(8, 8, letterA), new LetterTile(8, 9, letterB)];
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(true);
        });

        it('should return false if there is placed letters on the gameboard', () => {
            const letterCoords: LetterTile[] = [new LetterTile(7, 7, letterA), new LetterTile(7, 8, letterB)];
            gameboard.placeLetter(new LetterTile(0, 0, {} as Letter));
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(false);
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

    context('placeLetter tests', () => {
        let letterCoords: LetterTile[];
        const bonusPoint = 50;
        const points = 10;
        beforeEach(() => {
            letterCoords = [
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
                new LetterTile(1, 1, letterA),
            ];
        });

        it('should call validateWords() once', () => {
            placementService.placeLetter(letterCoords, player, gameboard);
            expect(dictionaryValidation.validateWords.calledOnce).to.equal(true);
        });

        it('should return false and the gameboard if validateWords returns 0', () => {
            dictionaryValidation.validateWords.returns(0);
            expect(placementService.placeLetter(letterCoords, player, gameboard)).to.eql([false, gameboard]);
        });

        it('should change player score if validateWords() dont return 0', () => {
            letterCoords = [new LetterTile(1, 1, letterA)];
            dictionaryValidation.validateWords.returns(points);
            placementService.placeLetter(letterCoords, player, gameboard);
            expect(player.score).to.equal(points);
        });

        it('should return true and gameboard if validateWords() dont return 0', () => {
            dictionaryValidation.validateWords.returns(points);
            expect(placementService.placeLetter(letterCoords, player, gameboard)).to.eql([true, gameboard]);
        });

        it('should give a bonus of 50 points', () => {
            dictionaryValidation.validateWords.returns(points);
            placementService.placeLetter(letterCoords, player, gameboard);
            expect(player.score).to.equal(points + bonusPoint);
        });
    });
});
