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

describe.only('Letter Placement Service', () => {
    // Should we stub gameboard ???

    let player: Player;
    let commandInfo: PlacementCommandInfo;
    let letterA: Letter;
    let letterB: Letter;
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

    context('placeLetter tests', () => {
        it('should return false and the gameboard if validateGameboardCoordinate returns empty array', () => {
            // gameboardCoordValidation.isFirstCoordValid.returns(false);
            validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([]);
            expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
        });

        it('should return false and gameboard if gameboard has no placed letters and lettersCoord do not include (x: 7, y: 7)', () => {
            validateCoordService.validateGameboardCoordinate
                .withArgs(commandInfo, gameboard)
                .returns([new GameboardCoordinate(0, 0, {} as Letter), new GameboardCoordinate(0, 1, {} as Letter)]);
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
        });

        it('should return false and gameboard if gameboard has no placed letters and lettersCoord do not include (x: 7, y: 7)', () => {
            validateCoordService.validateGameboardCoordinate
                .withArgs(commandInfo, gameboard)
                .returns([new GameboardCoordinate(0, 0, {} as Letter), new GameboardCoordinate(0, 1, {} as Letter)]);
            const allEqual = gameboard.gameboardCoords.every((tile) => tile.isOccupied === false);
            expect(allEqual).to.equal(true);
            expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
        });

        it('should return false and the gameboard if the placed letters are not in the player rack', () => {
            validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([]);
            expect(placementService.placeLetter(player, commandInfo, gameboard)).to.eql([false, gameboard]);
        });

        // it('should update the player rack after all letter placement', () => {
        //     gameboard.placeLetter(new GameboardCoordinate(7, 7, {} as Letter));
        //     validateCoordService.validateGameboardCoordinate.withArgs(commandInfo, gameboard).returns([new GameboardCoordinate(0, 0, letterA)]);
        //     const expectedRack: Letter[] = [letterB];
        //     placementService.placeLetter(player, commandInfo, gameboard);
        //     expect(player.rack).to.eql(expectedRack);
        // });
    });

    it('should return deep copy of playerRack', () => {
        // eslint-disable-next-line dot-notation
        const copyRack = placementService['createTempRack'](player);
        expect(copyRack).to.not.equal(player.rack);
        expect(copyRack).to.deep.equal(player.rack);
    });

    context('associateLettersWithRack tests', () => {
        let letterC: Letter;
        beforeEach(() => {
            letterC = { stringChar: 'c', points: 3 } as Letter;
        });

        it('return a list of letter', () => {
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterA)];
            expect(placementService['associateLettersWithRack'](letters, player.rack).length).to.eql(letters.length);
        });

        it('return empty list if letters are not in the rack', () => {
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player.rack)).to.eql([]);
        });

        it('return empty list if not every letters match the rack', () => {
            const letters: GameboardCoordinate[] = [new GameboardCoordinate(0, 0, letterC)];
            expect(placementService['associateLettersWithRack'](letters, player.rack)).to.eql([]);
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
            // eslint-disable-next-line dot-notation
            const newPlacedLettersCoords = placementService['createLetterPoints'](placedLettersCoords, lettersPlaced as Letter[]);
            const expectedLetters: GameboardCoordinate[] = [
                new GameboardCoordinate(0, 0, letterA),
                new GameboardCoordinate(0, 1, letterB),
                new GameboardCoordinate(0, 2, letterB),
            ];
            expect(newPlacedLettersCoords).to.eql(expectedLetters);
        });

        it('should return list with undefined if no placed letter coord match the letter placed', () => {
            placedLettersCoords = [new GameboardCoordinate(0, 0, { stringChar: 'c' } as Letter)];
            // eslint-disable-next-line dot-notation
            expect(placementService['createLetterPoints'](placedLettersCoords, lettersPlaced)).to.eql([]);
        });
    });
});
