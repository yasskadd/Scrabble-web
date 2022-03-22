/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Player } from '@app/classes/player/player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { CommandInfo } from '@common/interfaces/command-info';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { Game } from './game.service';
import { ErrorType, LetterPlacementService } from './letter-placement.service';

describe('Game tests', () => {
    let player1: Player;
    let player2: Player;
    let turn: SinonStubbedInstance<Turn> & Turn;
    let letterReserveService: SinonStubbedInstance<LetterReserveService> & LetterReserveService;
    let letterPlacementService: SinonStubbedInstance<LetterPlacementService> & LetterPlacementService;
    let game: Game;

    beforeEach(() => {
        player1 = new Player('player1');
        player1.name = 'OriginalName1';
        player2 = new Player('player2');
        player2.name = 'OriginalName2';
        turn = createStubInstance(Turn) as SinonStubbedInstance<Turn> & Turn;
        letterReserveService = createStubInstance(LetterReserveService) as SinonStubbedInstance<LetterReserveService> & LetterReserveService;
        letterPlacementService = createStubInstance(LetterPlacementService) as SinonStubbedInstance<LetterPlacementService> & LetterPlacementService;
        game = new Game(player1, player2, turn, letterReserveService, letterPlacementService);
    });

    it('creating new game should call generateLetter of letterReserveService two times', () => {
        expect(letterReserveService.generateLetters.callCount).to.equal(2);
    });

    it('creating new game should call create new gameboard', () => {
        expect(game.gameboard).to.not.equal(null);
        expect(typeof game.gameboard).to.equal('object');
    });

    it('start() should call determinePlayer', () => {
        game.start(player1, player2);
        expect(turn.determinePlayer.called).to.equal(true);
    });

    it('start() should call start of turn', () => {
        game.start(player1, player2);
        expect(turn.start.called).to.equal(true);
    });

    it('end() should called end of turn', () => {
        game.end();
        expect(turn.end.called).to.equal(true);
    });

    it('skip() should return false if no player has skipped', () => {
        const skip = game.skip('undefined');
        expect(skip).to.equal(false);
    });

    it('skip() should return true and end turn of player on skip', () => {
        turn.validating.returns(true);
        const skip = game.skip(player1.name);
        expect(skip).to.equal(true);
        expect(turn.skipTurn.called).to.equal(true);
    });

    it('skip() should return false if a player wants to skip but it is not his turn', () => {
        turn.validating.returns(false);
        const skip = game.skip(player1.name);
        expect(skip).to.equal(false);
        expect(turn.skipTurn.called).to.equal(false);
    });

    context('play test', () => {
        let letterA: Letter;
        let commandInfo: CommandInfo;

        beforeEach(() => {
            letterA = { value: 'a', quantity: 8, points: 1 };
            commandInfo = {
                firstCoordinate: { x: 8, y: 8 },
                isHorizontal: true,
                letters: ['a', 'a'],
            };
        });

        // eslint-disable-next-line max-len
        it('play() should return ReturnLetterReturn object and resetSkipCounter and endTurn() if the command word does not exist in dictionary for player1 on play', () => {
            game.gameboard.placeLetter({ x: 10, y: 8 }, 'a');
            const invalidWord = new Word(commandInfo, game.gameboard);
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([invalidWord, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: false, gameboard: game.gameboard, invalidWords: [invalidWord] });

            expect(game.play(player1, commandInfo)).to.eql({ hasPassed: false, gameboard: game.gameboard, invalidWords: [invalidWord] });
            expect(turn.resetSkipCounter.called).to.eql(true);
            expect(turn.end.called).to.eql(true);
        });

        it('play() should return invalid message if the command is invalid and end turn of player2 on play', () => {
            commandInfo.letters = ['a'];
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, 'InvalidMessage' as ErrorType]);

            expect(game.play(player2, commandInfo)).to.equal('InvalidMessage');
            expect(turn.resetSkipCounter.called).to.eql(true);
        });

        it('play() should return the gameboard if the command is valid of player1 on play', () => {
            const validWord = new Word(commandInfo, game.gameboard);
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([validWord, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: [] as Word[] });
            game.letterReserve = new LetterReserveService();
            expect(game.play(player1, commandInfo)).to.eql({ hasPassed: true, gameboard: game.gameboard, invalidWords: [] as Word[] });
        });

        it('play() should return the gameboard if the command is valid of player2 on play', () => {
            const validWord = new Word(commandInfo, game.gameboard);
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([validWord, null]);
            letterReserveService.isEmpty.returns(true);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: [] as Word[] });
            expect(game.play(player2, commandInfo)).to.eql({ hasPassed: true, gameboard: game.gameboard, invalidWords: [] as Word[] });
        });

        it('play() should return false and the gameboard if the player wants to play but it is not its turn', () => {
            turn.validating.returns(false);
            expect(game.play(player1, commandInfo)).to.eql({
                hasPassed: false,
                gameboard: game.gameboard,
                invalidWords: [] as Word[],
            });
        });

        it('play() should call giveNewLetterToRack and endOfGameVerification', () => {
            const giveNewLetterToRackStub = sinon.stub(game, 'giveNewLetterToRack' as never);
            const endOfGameVerificationStub = sinon.stub(game, 'endOfGameVerification' as never);
            const placeLettersReturnStub = { hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] };
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns(placeLettersReturnStub);
            letterReserveService.totalQuantity.returns(1);
            letterReserveService.lettersReserve = [{ value: 'a', quantity: 1, points: 1 }];
            letterReserveService.generateLetters.returns([letterA]);
            game.play(player1, commandInfo);
            expect(giveNewLetterToRackStub.called).to.equal(true);
            expect(endOfGameVerificationStub.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('giveNewLetterToRack() should call generateLetter of letterReserveService and gives everything in the reserve if there is more letter placed than the number of letter in the reserve', () => {
            const placeLettersReturnStub = { hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] };
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns(placeLettersReturnStub);
            letterReserveService.totalQuantity.returns(1);
            letterReserveService.lettersReserve = [{ value: 'a', quantity: 1, points: 1 }];
            letterReserveService.generateLetters.returns([letterA]);
            // eslint-disable-next-line dot-notation
            game['giveNewLetterToRack'](player1, commandInfo.letters.length, placeLettersReturnStub);
            expect(letterReserveService.generateLetters.calledWith(1)).to.equal(true);
        });

        it('giveNewLetterToRack() should call generateLetter of letterReserveService if placeLetters of letterPlacementService return true', () => {
            const placeLettersReturnStub = { hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] };
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns(placeLettersReturnStub);
            letterReserveService.isEmpty.returns(false);
            letterReserveService.totalQuantity.returns(commandInfo.letters.length);
            game.letterReserve = new LetterReserveService();
            // eslint-disable-next-line dot-notation
            game['giveNewLetterToRack'](player1, commandInfo.letters.length, placeLettersReturnStub);
            expect(letterReserveService.generateLetters.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('giveNewLetterToRack() should call generateLetter of letterReserveService with the quantity of letter that equals the quantity of letter placed', () => {
            const placeLettersReturnStub = { hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] };
            game = new Game(player1, player2, turn, letterReserveService, letterPlacementService);
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterReserveService.isEmpty.returns(false);
            letterPlacementService.placeLetters.returns(placeLettersReturnStub);
            letterReserveService.totalQuantity.returns(commandInfo.letters.length);
            letterReserveService.generateLetters.returns([letterA, letterA]);
            // eslint-disable-next-line dot-notation
            game['giveNewLetterToRack'](player1, commandInfo.letters.length, placeLettersReturnStub);
            expect(letterReserveService.generateLetters.calledWith(commandInfo.letters.length)).to.equal(true);
        });

        it('endGameVerification() should call end if the rack of the player1 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            // eslint-disable-next-line dot-notation
            game['endOfGameVerification'](player1);
            expect(endSpy.called).to.equal(true);
        });

        it('endGameVerification() should call end if the rack of the player2 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            // eslint-disable-next-line dot-notation
            game['endOfGameVerification'](player2);
            expect(endSpy.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('endGameVerification() should call resetSkipCounter and end of turn if the rack of the player1 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(false);
            game.letterReserve = new LetterReserveService();
            // eslint-disable-next-line dot-notation
            game['endOfGameVerification'](player1);
            expect(turn.end.called).to.equal(true);
            expect(turn.resetSkipCounter.called).to.equal(true);
        });

        // eslint-disable-next-line max-len
        it('endGameVerification() should call resetSkipCounter and end of turn if the rack of the player2 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            player2.rack = [];
            game.letterReserve = new LetterReserveService();
            // eslint-disable-next-line dot-notation
            game['endOfGameVerification'](player2);
            expect(turn.end.called).to.equal(true);
            expect(turn.resetSkipCounter.called).to.equal(true);
        });
    });

    it('exchange() should return the new player1 rack and end turn of player1 on exchange', () => {
        const oldPlayer2Rack = player2.rack;
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(true);
        const exchange = game.exchange(lettersToExchange, player1);
        expect(exchange).to.not.equal(lettersToExchange);
        expect(turn.end.called).to.equal(true);
        expect(oldPlayer2Rack).to.equal(player2.rack);
    });

    it('exchange() should return the new player2 rack and end turn of player2 on exchange', () => {
        const oldPlayer1Rack = player1.rack;
        const lettersToExchange = player2.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(true);
        const exchange = game.exchange(lettersToExchange, player2);
        expect(exchange).to.not.equal(lettersToExchange);
        expect(turn.end.called).to.equal(true);
        expect(oldPlayer1Rack).to.equal(player1.rack);
    });

    it('exchange() should reset skipCounter and end turn of the player on exchange', () => {
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(true);
        game.exchange(lettersToExchange, player1);

        expect(turn.resetSkipCounter.called).to.equal(true);
        expect(turn.end.called).to.equal(true);
    });

    it('exchange() should return an empty array if a player wants to exchange but it is not his turn', () => {
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(false);
        const exchange = game.exchange(lettersToExchange, player1);
        expect(exchange).to.deep.equal([]);
    });

    it('abandon() should called end of game', () => {
        const endSpy = spy(game, 'end');
        game.abandon();
        expect(endSpy.called).to.equal(true);
        expect(turn.end.called).to.equal(true);
    });
});
