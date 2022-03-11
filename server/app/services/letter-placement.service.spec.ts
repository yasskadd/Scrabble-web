/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';
import { LetterPlacementService } from './letter-placement.service';

describe('Letter Placement Service', () => {
    let player: Player;
    let commandInfo: CommandInfo;
    let gameboard: Gameboard;
    let placementService: LetterPlacementService;
    let dictionaryValidation: Sinon.SinonStubbedInstance<DictionaryValidationService>;
    let word: Word;

    beforeEach(() => {
        player = new Player('test');
        player.rack = [
            { value: 'a', quantity: 1, points: 1 },
            { value: 'b', quantity: 1, points: 1 },
        ];
        player.score = 0;
        player.room = 'testRoom';
        commandInfo = {
            firstCoordinate: { x: 1, y: 1 },
            isHorizontal: true,
            letters: ['a', 'l', 'l'],
        };

        word = new Word(
            {
                firstCoordinate: { x: 1, y: 1 },
                isHorizontal: true,
                letters: ['t', 'o', 'u', 't'],
            },
            gameboard,
        );

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
        it('areLettersInRack() should return true if letter is in rack', () => {
            /*TODO*/
        });

        it('areLettersInRack() should return false if letter is not in rack', () => {
            /*TODO*/
        });

        it('return a list of 1 letter if only 1 letter is in command and it is present in rack', () => {
            expect(placementService['associateLettersWithRack']('a', player).length).to.eql(1);
        });

        it('return empty list if letters are not in the rack', () => {
            expect(placementService['associateLettersWithRack']('c', player)).to.eql([]);
        });

        it('return empty list if not every letters match the rack', () => {
            expect(placementService['associateLettersWithRack']('c', player)).to.eql([]);
        });

        // TODO
        // it('should set isBlank attribute to true and points to 0 if letter i uppercase', () => {
        //     placementService['associateLettersWithRack']('C', player);
        //     expect(letters[0].letter.isBlankLetter).to.equal(true);
        //     expect(letters[0].letter.points).to.equal(0);
        // });

        it('should return false if lettersCoords do not match the player rack', () => {
            expect(placementService['areLettersInRack'](['c', 'a'], player)).to.equal(false);
        });

        it('should return false if there is only one letter not matching the player rack', () => {
            expect(placementService['areLettersInRack'](['a', 'b'], player)).to.equal(false);
        });

        it('should return false if player rack is empty', () => {
            player.rack = [];
            expect(placementService['areLettersInRack'](['a'], player)).to.equal(false);
        });

        it('should return false if there is 2 times the same letter in letterCoords but only once in player rack', () => {
            expect(placementService['areLettersInRack'](['a', 'a'], player)).to.equal(false);
        });

        it('should return true if all lettersCoords match exactly the player rack', () => {
            expect(placementService['areLettersInRack'](['a', 'b'], player)).to.equal(true);
        });

        it('should return true if all the letterCoords are in the player rack but dont match exactly', () => {
            expect(placementService['areLettersInRack'](['a'], player)).to.equal(true);
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
            const allEqual = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(
                placementService['verifyFirstTurn'](
                    [
                        { x: 8, y: 8 },
                        { x: 8, y: 9 },
                    ],
                    gameboard,
                ),
            ).to.equal(true);
        });

        it('should return true if there is placed letters on the gameboard', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            expect(
                placementService['verifyFirstTurn'](
                    [
                        { x: 8, y: 8 },
                        { x: 8, y: 9 },
                    ],
                    gameboard,
                ),
            ).to.equal(true);
        });
    });

    context('globalCommandVerification() tests', () => {
        let validateCommandCoordinateStub: Sinon.SinonStub<unknown[], unknown>;
        let lettersInRackStub: Sinon.SinonStub<unknown[], unknown>;
        let invalidFirstPlacementStub: Sinon.SinonStub<unknown[], unknown>;
        let letterCoords: Coordinate[];
        beforeEach(() => {
            validateCommandCoordinateStub = Sinon.stub(placementService, 'validateCommandCoordinate' as never);
            lettersInRackStub = Sinon.stub(placementService, 'areLettersInRack' as never);
            invalidFirstPlacementStub = Sinon.stub(placementService, 'verifyFirstTurn' as never);
            letterCoords = [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
            ];
        });

        afterEach(() => {
            validateCommandCoordinateStub.restore();
            lettersInRackStub.restore();
            invalidFirstPlacementStub.restore();
        });

        it('should return array with letterCoords and invalidPlacement string if isPlacement() returns false', () => {
            validateCommandCoordinateStub.withArgs(commandInfo, gameboard).returns(false);
            const expectedReturn = [letterCoords, 'Placement invalide pour la premiere coordonnée'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with letterCoords and lettersNotInRack string if areLettersInRack() returns false', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(false);
            const expectedReturn = [letterCoords, 'Lettres absents du chevalet'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return letterCoords and invalidFirstPlacement string if verifyFirstTurn() returns false', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            invalidFirstPlacementStub.returns(false);
            const expectedReturn = [letterCoords, 'Placement du premier tour pas valide'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return letterCoords and null if verification is valid', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            invalidFirstPlacementStub.returns(true);
            const expectedReturn = [letterCoords, null];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });
    });

    context('placeLetters tests', () => {
        const bonusPoint = 50;
        const points = 10;
        beforeEach(() => {
            word = {} as Word;
            commandInfo = {} as CommandInfo;
        });

        it('should call validateWord() once', () => {
            placementService.placeLetters(word, commandInfo, player, gameboard);
            expect(dictionaryValidation.validateWord.calledOnce).to.equal(true);
        });

        it('should return false and the gameboard if validateWord returns 0', () => {
            dictionaryValidation.validateWord.returns(0);
            expect(placementService.placeLetters(word, commandInfo, player, gameboard)).to.eql([false, gameboard]);
        });

        it('should change player score if validateWord() doesnt return 0', () => {
            dictionaryValidation.validateWord.returns(points);
            placementService.placeLetters(word, commandInfo, player, gameboard);
            expect(player.score).to.equal(points);
        });

        it('should return true and gameboard if validateWord() doesnt return 0', () => {
            dictionaryValidation.validateWord.returns(points);
            expect(placementService.placeLetters(word, commandInfo, player, gameboard)).to.eql([true, gameboard]);
        });

        it('should give a bonus of 50 points', () => {
            dictionaryValidation.validateWord.returns(points);
            placementService.placeLetters(word, commandInfo, player, gameboard);
            expect(player.score).to.equal(points + bonusPoint);
        });
    });
});
