/* eslint-disable dot-notation */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { PlacementCommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { BoxMultiplier } from './box-multiplier.service';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { LetterPlacementService } from './letter-placement.service';
import { WordFinderService } from './word-finder.service';

describe('Letter Placement Service', () => {
    // Should we stub gameboard ???
    let player: Player;
    let commandInfo: PlacementCommandInfo;
    let letterA: Letter;
    let letterB: Letter;
    let letterC: Letter;
    let gameboard: GameBoard;
    let placementService: LetterPlacementService;
    // let gameboardCoordValidation: Sinon.SinonStubbedInstance<GameboardCoordinateValidationService>;
    let validateCoordService: Sinon.SinonStubbedInstance<GameboardCoordinateValidationService>;
    let wordFinderService: Sinon.SinonStubbedInstance<WordFinderService>;
    let dictionaryValidation: Sinon.SinonStubbedInstance<DictionaryValidationService>;
    let boxMultiplierService: Sinon.SinonStubbedInstance<BoxMultiplier>;

    beforeEach(() => {
        letterA = { stringChar: 'a', points: 1 } as Letter;
        letterB = { stringChar: 'b', points: 2 } as Letter;
        letterC = { stringChar: 'c', points: 3 } as Letter;

        player = { rack: [letterA, letterB], score: 0, name: 'test', room: 'testRoom' };
        commandInfo = {
            firstCoordinate: { x: 0, y: 0 } as GameboardCoordinate,
            direction: 'h',
            lettersPlaced: ['a', 'l', 'l'],
        } as PlacementCommandInfo;

        wordFinderService = Sinon.createStubInstance(WordFinderService);
        validateCoordService = Sinon.createStubInstance(GameboardCoordinateValidationService);
        boxMultiplierService = Sinon.createStubInstance(BoxMultiplier);
        gameboard = new GameBoard(boxMultiplierService);
        // gameboardCoordValidation = Sinon.createStubInstance(GameboardCoordinateValidationService);
        placementService = new LetterPlacementService(
            validateCoordService,
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
        const expectedCoords = [new GameboardCoordinate(3, 3, letterA), new GameboardCoordinate(4, 3, letterB)];
        validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns(expectedCoords);
        const letterCoords = placementService['getLettersCoord'](commandInfo, gameboard);
        expect(letterCoords).to.equal(expectedCoords);
    });

    it('isPlacementValid should return false if letterCoords list is empty', () => {
        const letterCoords: GameboardCoordinate[] = [];
        expect(placementService['isPlacementValid'](letterCoords)).to.equal(false);
    });

    it('isPlacementValid should return true if letterCoords list is not empty', () => {
        const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
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
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
            expect(placementService['associateLettersWithRack'](letters, player).length).to.eql(letters.length);
        });

        it('return empty list if letters are not in the rack', () => {
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
        });

        it('return empty list if not every letters match the rack', () => {
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player)).to.eql([]);
        });
    });

    context('createLetterPoints tests', () => {
        let placedLettersCoords: GameboardCoordinate[];
        let lettersPlaced: Letter[];

        beforeEach(() => {
            placedLettersCoords = [
                new GameboardCoordinate(0, 0, { stringChar: 'a' } as Letter),
                new GameboardCoordinate(0, 1, { stringChar: 'b' } as Letter),
                new GameboardCoordinate(0, 2, { stringChar: 'b' } as Letter),
            ];
            lettersPlaced = [letterA, letterB];
        });

        it('should return a list of gameboardCoordinate with correct points', () => {
            const newPlacedLettersCoords = placementService['createLetterPoints'](placedLettersCoords, lettersPlaced as Letter[]);
            const expectedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 0, letterA),
                new GameboardCoordinate(0, 1, letterB),
                new GameboardCoordinate(0, 2, letterB),
            ];
            expect(newPlacedLettersCoords).to.eql(expectedLetters);
        });

        it('should return an empty list if no placed letter coord match the letter placed', () => {
            placedLettersCoords = [new GameboardCoordinate(0, 0, { stringChar: 'c' } as Letter)];
            expect(placementService['createLetterPoints'](placedLettersCoords, lettersPlaced)).to.eql([]);
        });
    });

    context('areLettersInRack() tests', () => {
        it('should return false if lettersCoords do not match the player rack', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterC), new GameboardCoordinate(0, 0, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if there is only one letter not matching the player rack', () => {
            const letterCoords: GameboardCoordinate[] = [
                new GameboardCoordinate(1, 1, letterA),
                new GameboardCoordinate(0, 0, letterB),
                new GameboardCoordinate(0, 0, letterC),
            ];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if player rack is empty', () => {
            player.rack = [];
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return false if there is 2 times the same letter in letterCoords but only once in player rack', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA), new GameboardCoordinate(1, 1, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(false);
        });

        it('should return true if all lettersCoords match exactly the player rack', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterA), new GameboardCoordinate(0, 0, letterB)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(true);
        });

        it('should return true if all the letterCoords are in the player rack but dont match exactly', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(1, 1, letterA)];
            expect(placementService['areLettersInRack'](letterCoords, player)).to.equal(true);
        });
    });

    context('verifyFirstTurn tests', () => {
        it('should return false if gameboard has no placed letters and letterCoords do not include (7, 7,) coordinate', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA), new GameboardCoordinate(0, 1, letterB)];
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(false);
        });

        it('should return true if gameboard has no placed letters and letterCoords includes (7, 7,) coordinate', () => {
            const letterCoords: GameboardCoordinate[] = [new GameboardCoordinate(7, 7, letterA), new GameboardCoordinate(7, 8, letterB)];
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService['verifyFirstTurn'](letterCoords, gameboard)).to.equal(true);
        });
    });

    context('globalCommandVerification() tests', () => {
        it('should return array with letterCoords and invalidPlacement string if isPlacement() returns false', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isPlacementStub = Sinon.stub(placementService, 'isPlacementValid' as any);
            isPlacementStub.withArgs(commandInfo, gameboard).returns(false);
            const expectedReturn = [placementService['getLettersCoord'](commandInfo, gameboard), 'Invalid placement'];
            expect(placementService.globalCommandVerification(commandInfo, gameboard, player)).to.eql(expectedReturn);
        });
    });

    // context('placeLetter tests', () => {
    //     it('should return false and the gameboard if validateGameboardCoordinate returns empty array', () => {
    //         // gameboardCoordValidation.isFirstCoordValid.returns(false);
    //         validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([]);
    //         expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
    //     });

    //     it('should return false and gameboard if gameboard has no placed letters and lettersCoord do not include (x: 7, y: 7)', () => {
    //         validateCoordService.validateGameboardCoordinate
    //             .withArgs(commandInfo, gameboard)
    //             .returns([new GameboardCoordinate(0, 0, {} as Letter), new GameboardCoordinate(0, 1, {} as Letter)]);
    //         const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
    //         expect(allEqual).to.equal(true);
    //         expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
    //     });

    //     it('should return false and gameboard if gameboard has no placed letters and lettersCoord do not include (x: 7, y: 7)', () => {
    //         validateCoordService.validateGameboardCoordinate
    //             .withArgs(commandInfo, gameboard)
    //             .returns([new GameboardCoordinate(0, 0, {} as Letter), new GameboardCoordinate(0, 1, {} as Letter)]);
    //         const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
    //         expect(allEqual).to.equal(true);
    //         expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
    //     });

    //     it('should return false and the gameboard if the placed letters are not in the player rack', () => {
    //         validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([]);
    //         expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
    //     });

    //     it('should update the player rack after all letter placement', () => {
    //         gameboard.placeLetter(new GameboardCoordinate(7, 7, {} as Letter));
    //         validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([new GameboardCoordinate(0, 0, letterA)]);
    //         const expectedRack: Letter[] = [letterB];
    //         placementService.placeLetter(player, commandInfo, gameboard);
    //         expect(player.rack).to.eql(expectedRack);
    //     });
    // });
});
