/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
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

        gameboard = new Gameboard();
        dictionaryValidation = Sinon.createStubInstance(DictionaryValidationService);
        placementService = new LetterPlacementService(dictionaryValidation as unknown as DictionaryValidationService);
    });

    context('validateCommandCoordinate() tests', () => {
        it('validateCommandCoordinate() should return true if coord is valid and position is not Occupied', () => {
            expect(placementService['validateCommandCoordinate']({ x: 1, y: 1 }, gameboard)).to.equal(true);
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
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            expect(placementService['validateCommandCoordinate']({ x: 1, y: 1 }, gameboard)).to.equal(false);
        });
    });

    context('upDownLeftOrRightAreOccupied tests', () => {
        it('upDownLeftOrRightAreOccupied() should return true if up, down, left and right are ALL in board limits and isOccupied true', () => {
            gameboard.placeLetter({ x: 2, y: 1 }, 'a');
            gameboard.placeLetter({ x: 2, y: 3 }, 'a');
            gameboard.placeLetter({ x: 1, y: 2 }, 'a');
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');
            expect(placementService['upDownLeftOrRightAreOccupied']({ x: 2, y: 2 }, gameboard)).to.equal(true);
        });

        it('upDownLeftOrRightAreOccupied() should return false if left or up in not in board limits and isOccupied false', () => {
            expect(placementService['upDownLeftOrRightAreOccupied']({ x: 1, y: 1 }, gameboard)).to.equal(false);
        });

        it('upDownLeftOrRightAreOccupied() should return true if ONLY down in board limits and isOccupied true', () => {
            gameboard.placeLetter({ x: 2, y: 3 }, 'a');
            expect(placementService['upDownLeftOrRightAreOccupied']({ x: 2, y: 2 }, gameboard)).to.equal(true);
        });

        it('upDownLeftOrRightAreOccupied() should return true if ONLY left in board limits and isOccupied true', () => {
            gameboard.placeLetter({ x: 1, y: 2 }, 'a');
            expect(placementService['upDownLeftOrRightAreOccupied']({ x: 2, y: 2 }, gameboard)).to.equal(true);
        });

        it('upDownLeftOrRightAreOccupied() should return true if ONLY right in board limits and isOccupied true', () => {
            gameboard.placeLetter({ x: 3, y: 2 }, 'a');
            expect(placementService['upDownLeftOrRightAreOccupied']({ x: 2, y: 2 }, gameboard)).to.equal(true);
        });
    });

    context('wordIsPlacedCorrectly() tests', () => {
        beforeEach(() => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );
        });

        it('wordIsPlacedCorrectly() should call verifyFirstTurn() if isFirstTurn() returns true', () => {
            const lettersInRackStub = Sinon.stub(placementService, 'isFirstTurn' as never);
            lettersInRackStub.returns(true);
            const verifyFirstTurnStub = Sinon.stub(placementService, 'verifyFirstTurn' as never);

            placementService['wordIsPlacedCorrectly'](word.newLetterCoords, gameboard);
            expect(verifyFirstTurnStub.calledOnce).to.equal(true);
        });

        it('wordIsPlacedCorrectly() should call isWordIsAttachedToBoardLetter() if isFirstTurn() returns false', () => {
            const lettersInRackStub = Sinon.stub(placementService, 'isFirstTurn' as never);
            lettersInRackStub.returns(false);
            const isWordIsAttachedToBoardLetterStub = Sinon.stub(placementService, 'isWordIsAttachedToBoardLetter' as never);

            placementService['wordIsPlacedCorrectly'](word.newLetterCoords, gameboard);
            expect(isWordIsAttachedToBoardLetterStub.calledOnce).to.equal(true);
        });

        it('isFirstTurn() should return true if gameboard is empty', () => {
            expect(placementService['isFirstTurn'](gameboard)).to.equal(true);
        });

        it('isFirstTurn() should return false if gameboard is not empty', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            expect(placementService['isFirstTurn'](gameboard)).to.equal(false);
        });
    });

    context('isWordIsAttachedToBoardLetter() tests ', () => {
        it('isWordIsAttachedToBoardLetter() should return false if gameboard is empty', () => {
            const upDownLeftOrRightAreOccupiedStub = Sinon.stub(placementService, 'upDownLeftOrRightAreOccupied' as never);
            upDownLeftOrRightAreOccupiedStub.returns(false);
            expect(
                placementService['isWordIsAttachedToBoardLetter'](
                    [
                        { x: 1, y: 1 },
                        { x: 2, y: 1 },
                    ],
                    gameboard,
                ),
            ).to.equal(false);
        });

        it('isWordIsAttachedToBoardLetter() should return true if gameboard contains letter next to word', () => {
            const upDownLeftOrRightAreOccupied = Sinon.stub(placementService, 'upDownLeftOrRightAreOccupied' as never);
            upDownLeftOrRightAreOccupied.returns(true);
            gameboard.placeLetter({ x: 1, y: 2 }, 'a');
            expect(
                placementService['isWordIsAttachedToBoardLetter'](
                    [
                        { x: 1, y: 1 },
                        { x: 2, y: 1 },
                    ],
                    gameboard,
                ),
            ).to.equal(true);
        });
    });

    context('areLettersInRack() tests', () => {
        it('areLettersInRack() should return true if letter is in rack', () => {
            expect(placementService['areLettersInRack'](['b'], player)).to.equal(true);
        });

        it('areLettersInRack() should return false if letter is not in rack', () => {
            expect(placementService['areLettersInRack'](['c'], player)).to.equal(false);
        });

        it('return a list of 1 letter if only 1 letter is in command and it is present in rack', () => {
            expect(placementService['findLettersPresentInRack'](['a'], player.rack).length).to.eql(1);
        });

        it('return empty list if letters are not in the rack', () => {
            expect(placementService['findLettersPresentInRack'](['c'], player.rack)).to.eql([]);
        });

        it('return empty list if not every letters match the rack', () => {
            expect(placementService['findLettersPresentInRack'](['c'], player.rack)).to.eql([]);
        });

        it('should return false if letters do not match the player rack', () => {
            expect(placementService['areLettersInRack'](['c', 'a'], player)).to.equal(false);
        });

        it('should return false if letters do not match the player rack', () => {
            expect(placementService['areLettersInRack'](['c', '*'], player)).to.equal(false);
        });

        it('should return false if there is only one letter not matching the player rack', () => {
            expect(placementService['areLettersInRack'](['a', 'c'], player)).to.equal(false);
        });

        it('should return false if player rack is empty', () => {
            player.rack = [];
            expect(placementService['areLettersInRack'](['a'], player)).to.equal(false);
        });

        it('should return false if there is 2 times the same letter in letterCoords but only once in player rack', () => {
            expect(placementService['areLettersInRack'](['a', 'a'], player)).to.equal(false);
        });

        it('should return true if all letters match exactly the player rack', () => {
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
            word = new Word(
                {
                    firstCoordinate: { x: 8, y: 8 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );
            const allUnoccupied = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allUnoccupied).to.equal(true);
            expect(placementService['verifyFirstTurn'](word.wordCoords)).to.equal(true);
        });

        it('should return true if gameboard has no placed letters and letterCoords do not include middle coordinate', () => {
            word = new Word(
                {
                    firstCoordinate: { x: 1, y: 1 },
                    isHorizontal: true,
                    letters: ['a', 'b'],
                },
                gameboard,
            );
            const allUnoccupied = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allUnoccupied).to.equal(true);
            expect(placementService['verifyFirstTurn'](word.wordCoords)).to.equal(false);
        });

        it('should return true if gameboard has no placed letters and letterCoords includes middle coordinate', () => {
            const allEqual = gameboard.gameboardTiles.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(
                placementService['verifyFirstTurn']([
                    { x: 8, y: 8 },
                    { x: 8, y: 9 },
                ]),
            ).to.equal(true);
        });

        it('should return true if there is placed letters on the gameboard', () => {
            gameboard.placeLetter({ x: 1, y: 1 }, 'a');
            expect(
                placementService['verifyFirstTurn']([
                    { x: 8, y: 8 },
                    { x: 8, y: 9 },
                ]),
            ).to.equal(true);
        });
    });

    context('globalCommandVerification() tests', () => {
        let validateCommandCoordinateStub: Sinon.SinonStub<unknown[], unknown>;
        let lettersInRackStub: Sinon.SinonStub<unknown[], unknown>;
        let wordIsPlacedCorrectlyStub: Sinon.SinonStub<unknown[], unknown>;
        beforeEach(() => {
            validateCommandCoordinateStub = Sinon.stub(placementService, 'validateCommandCoordinate' as never);
            lettersInRackStub = Sinon.stub(placementService, 'areLettersInRack' as never);
            wordIsPlacedCorrectlyStub = Sinon.stub(placementService, 'wordIsPlacedCorrectly' as never);
        });

        afterEach(() => {
            validateCommandCoordinateStub.restore();
            lettersInRackStub.restore();
            wordIsPlacedCorrectlyStub.restore();
        });

        it('should return array with empty Word object and commandCoordinateOutOfBounds string if validateCommandCoordinate() returns false', () => {
            validateCommandCoordinateStub.withArgs(commandInfo, gameboard).returns(false);
            const expectedReturn = [{}, 'Placement invalide pour la premiere coordonnée'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with empty Word object and lettersNotInRack string if areLettersInRack() returns false', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(false);
            const expectedReturn = [{}, 'Les lettres ne sont pas dans le chavalet'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with empty Word object and invalidFirstWordPlacement string if wordIsPlacedCorrectly() returns false', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            wordIsPlacedCorrectlyStub.returns(false);
            const expectedReturn = [{}, "Le mot doit être attaché à un autre mot (ou passer par la case du milieu si c'est le premier tour)"];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with empty Word object and invalidWordBuild if newly word created is out of bounce', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            const commandInfoOutOfBounce = {
                firstCoordinate: { x: 15, y: 1 },
                isHorizontal: true,
                letters: ['a', 'l', 'l'],
            };
            const expectedReturn = [{}, "Le mot ne possède qu'une lettre OU les lettres en commande sortent du plateau"];
            expect(placementService.globalCommandVerification(commandInfoOutOfBounce, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with empty Word object and invalidWordBuild if newly word created has only one letter', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            const commandInfoOneLetter = {
                firstCoordinate: { x: 1, y: 1 },
                isHorizontal: true,
                letters: ['a'],
            };
            const expectedReturn = [{}, "Le mot ne possède qu'une lettre OU les lettres en commande sortent du plateau"];
            expect(placementService.globalCommandVerification(commandInfoOneLetter, gameboard, player)).to.eql(expectedReturn);
        });

        it('should return array with Word object and null if verification is valid', () => {
            validateCommandCoordinateStub.returns(true);
            lettersInRackStub.returns(true);
            wordIsPlacedCorrectlyStub.returns(true);
            const expectedWord = {
                isValid: true,
                isHorizontal: true,
                stringFormat: 'all',
                points: 0,
                newLetterCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ],
                wordCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ],
            };
            const expectedReturn = [expectedWord, null];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });
    });

    context('placeLetters tests', () => {
        const bonusPoint = 50;
        const points = 10;
        beforeEach(() => {
            word = {
                isValid: true,
                isHorizontal: true,
                stringFormat: 'all',
                points: 0,
                newLetterCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ],
                wordCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                ],
            } as Word;
        });

        it('should call validateWord() once', () => {
            dictionaryValidation.validateWord.returns({
                points: 0,
                invalidWords: [] as Word[],
            });
            commandInfo = {
                firstCoordinate: { x: 1, y: 1 },
                isHorizontal: true,
                letters: ['a', 'l', 'L'],
            };
            placementService.placeLetters(word, commandInfo, player, gameboard);
            expect(dictionaryValidation.validateWord.calledOnce).to.equal(true);
        });

        it('should return false and the gameboard if validateWord returns 0', () => {
            const validateWordReturn = {
                points: 0,
                invalidWords: [
                    {
                        isValid: false,
                        isHorizontal: true,
                        stringFormat: 'a',
                        points: 0,
                        newLetterCoords: [{ x: 1, y: 1 }],
                        wordCoords: [{ x: 1, y: 1 }],
                    } as Word,
                ] as Word[],
            };
            dictionaryValidation.validateWord.returns(validateWordReturn);

            const expected = { hasPassed: false, gameboard, invalidWords: validateWordReturn.invalidWords };
            expect(placementService.placeLetters(word, commandInfo, player, gameboard)).to.eql(expected);
        });

        it('should change player score if validateWord() doesnt return 0', () => {
            const validateWordReturn = {
                points: 10,
                invalidWords: [] as Word[],
            };
            dictionaryValidation.validateWord.returns(validateWordReturn);
            placementService.placeLetters(word, commandInfo, player, gameboard);
            expect(player.score).to.equal(validateWordReturn.points);
        });

        it('should return true and gameboard if validateWord() doesnt return 0', () => {
            dictionaryValidation.validateWord.returns({ points: 10, invalidWords: [] as Word[] });
            const expected = { hasPassed: true, gameboard, invalidWords: [] };
            expect(placementService.placeLetters(word, commandInfo, player, gameboard)).to.eql(expected);
        });

        it('should give a bonus of 50 points', () => {
            const sevenLetterWord = {
                isValid: true,
                isHorizontal: true,
                stringFormat: 'a',
                points: 10,
                newLetterCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 5, y: 1 },
                    { x: 6, y: 1 },
                    { x: 7, y: 1 },
                ],
                wordCoords: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 1 },
                    { x: 5, y: 1 },
                    { x: 6, y: 1 },
                    { x: 7, y: 1 },
                ],
            } as Word;

            const newCommandInfo = {
                firstCoordinate: { x: 1, y: 1 },
                isHorizontal: true,
                letters: ['a', 'l', 'l', 'a', 'l', 'l', 'l', 'l'],
            };
            dictionaryValidation.validateWord.returns({ points: 10, invalidWords: [] as Word[] });
            placementService.placeLetters(sevenLetterWord, newCommandInfo, player, gameboard);
            expect(player.score).to.equal(points + bonusPoint);
        });

        it('updatePlayerRack should remove * if capital letter is found in commandInfo.letters', () => {
            player.rack = [
                { value: 'a', quantity: 1, points: 1 },
                { value: '*', quantity: 1, points: 0 },
            ];
            placementService['updatePlayerRack'](['a', 'L'], player.rack);
            expect(player.rack.length).to.equal(0);
        });
    });
});
