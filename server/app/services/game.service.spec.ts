/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Player } from '@app/classes/player/player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { CommandInfo } from '@common/command-info';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { Game } from './game.service';
import { ErrorType, LetterPlacementService, PlaceLettersReturn } from './letter-placement.service';

describe('Game tests', () => {
    let player1: Player;
    let player2: Player;
    let turn: SinonStubbedInstance<Turn> & Turn;
    let letterReserveService: SinonStubbedInstance<LetterReserveService>;
    let letterPlacementService: SinonStubbedInstance<LetterPlacementService> & LetterPlacementService;
    let game: Game;

    beforeEach(() => {
        player1 = new Player('player1');
        player1.name = 'OriginalName1';
        player2 = new Player('player2');
        player2.name = 'OriginalName2';
        turn = createStubInstance(Turn) as SinonStubbedInstance<Turn> & Turn;
        letterReserveService = createStubInstance(LetterReserveService);
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
        expect(turn.determinePlayer.called).to.be.true;
    });

    it('start() should call start of turn', () => {
        game.start(player1, player2);
        expect(turn.start.called).to.be.true;
    });

    it('end() should called end of turn', () => {
        game.end();
        expect(turn.end.called).to.be.true;
    });

    it('skip() should return false if no player has skipped', () => {
        const skip = game.skip('undefined');
        expect(skip).to.be.false;
    });

    it('skip() should return true and end turn of player on skip', () => {
        turn.validating.returns(true);
        const skip = game.skip(player1.name);
        expect(skip).to.be.true;
        expect(turn.skipTurn.called).to.be.true;
    });

    it('skip() should return false if a player wants to skip but it is not his turn', () => {
        turn.validating.returns(false);
        const skip = game.skip(player1.name);
        expect(skip).to.be.false;
        expect(turn.skipTurn.called).to.be.false;
    });

    context('play test', () => {
        let letterA: Letter;
        let posX: number;
        let posY: number;
        let commandInfo: CommandInfo;

        beforeEach(() => {
            letterA = { value: 'a', quantity: 8, points: 1 };
            posX = 8;
            posY = 8;
            commandInfo = {
                firstCoordinate: { x: posX, y: posY },
                isHorizontal: true,
                letters: [letterA.value, letterA.value],
            };
        });

        it('play() should return invalid message if the command is invalid and end turn of player1 on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, 'InvalidMessage' as ErrorType]);
            const play: string | PlaceLettersReturn = game.play(player1, commandInfo);
            expect(play[0]).to.equal('');
            expect(turn.resetSkipCounter.called).to.be.true;
            expect(turn.end.called).to.be.true;
        });

        it('play() should return invalid message if the command is invalid and end turn of player2 on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, 'InvalidMessage' as ErrorType]);
            const play: string | PlaceLettersReturn = game.play(player2, commandInfo);
            expect(play[0]).to.equal('');
            expect(turn.resetSkipCounter.called).to.be.true;
            expect(turn.end.called).to.be.true;
        });

        it('play() should return the gameboard if the command is valid of player1 on play', () => {
            const expectedGameboard = game.gameboard;
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            const play: string | PlaceLettersReturn = game.play(player1, commandInfo);
            expect(play[1]).to.equal(expectedGameboard);
        });

        it('play() should return the gameboard if the command is valid of player2 on play', () => {
            const expectedGameboard = game.gameboard;
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            const play: string | PlaceLettersReturn = game.play(player2, commandInfo);
            expect(play[1]).to.equal(expectedGameboard);
        });

        it('play() should return false and the gameboard if the player wants to play but it is not its turn', () => {
            const expected: PlaceLettersReturn = {
                hasPassed: false,
                gameboard: game.gameboard,
                invalidWords: [new Word(commandInfo, game.gameboard)],
            };
            turn.validating.returns(false);
            const play: string | PlaceLettersReturn = game.play(player1, commandInfo);
            expect(play).to.deep.equal(expected);
        });

        it('play() should call generateLetter of letterReserveService if placeLetters of letterPlacementService return true', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            game.play(player1, commandInfo);
            expect(letterReserveService.generateLetters.called).to.be.true;
        });

        it('play() should call end if the rack of the player1 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            game.play(player1, commandInfo);
            expect(endSpy.called).to.be.true;
        });

        it('play() should call end if the rack of the player2 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            game.play(player2, commandInfo);
            expect(endSpy.called).to.be.true;
        });

        it('play() should call resetSkipCounter and end of turn if the rack of the player1 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            letterReserveService.isEmpty.returns(false);
            game.play(player1, commandInfo);
            expect(turn.end.called).to.be.true;
            expect(turn.resetSkipCounter.called).to.be.true;
        });

        it('play() should call resetSkipCounter and end of turn if the rack of the player2 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([{} as Word, null]);
            letterPlacementService.placeLetters.returns({ hasPassed: true, gameboard: game.gameboard, invalidWords: {} as Word[] });
            player2.rack = [];
            game.play(player2, commandInfo);
            expect(turn.end.called).to.be.true;
            expect(turn.resetSkipCounter.called).to.be.true;
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
        expect(turn.end.called).to.be.true;
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
        expect(turn.end.called).to.be.true;
        expect(oldPlayer1Rack).to.equal(player1.rack);
    });

    it('exchange() should reset skipCounter and end turn of the player on exchange', () => {
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(true);
        game.exchange(lettersToExchange, player1);

        expect(turn.resetSkipCounter.called).to.be.true;
        expect(turn.end.called).to.be.true;
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
        expect(endSpy.called).to.be.true;
        expect(turn.end.called).to.be.true;
    });
});
