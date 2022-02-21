/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Player } from '@app/classes/player.class';
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/command-info';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { Game } from './game.service';
import { LetterPlacementService } from './letter-placement.service';

describe.only('Game tests', () => {
    let player1: Player;
    let player2: Player;
    let turn: SinonStubbedInstance<Turn> & Turn;
    let letterReserveService: SinonStubbedInstance<LetterReserveService>;
    let letterPlacementService: SinonStubbedInstance<LetterPlacementService> & LetterPlacementService;
    let game: Game;

    beforeEach(() => {
        player1 = new Player('player1');
        player2 = new Player('player2');
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
        game.start();
        expect(turn.determinePlayer.called).to.be.true;
    });

    it('start() should call start of turn', () => {
        game.start();
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
            commandInfo = commandInfo = {
                firstCoordinate: new LetterTile(posX, posY, letterA),
                direction: 'h',
                lettersPlaced: [letterA.value, letterA.value],
            };
        });

        it('play() should return invalid message if the command is invalid and end turn of player1 on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], 'Invalid']);
            const play = game.play(player1.name, commandInfo);
            expect(play).to.equal('Invalid');
            expect(turn.resetSkipCounter.called).to.be.true;
            expect(turn.end.called).to.be.true;
        });

        it('play() should return invalid message if the command is invalid and end turn of player2 on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], 'Invalid']);
            const play = game.play(player2.name, commandInfo);
            expect(play).to.equal('Invalid');
            expect(turn.resetSkipCounter.called).to.be.true;
            expect(turn.end.called).to.be.true;
        });

        it('play() should return the gameboard if the command is valid of player1 on play', () => {
            const expectedGameboard = game.gameboard;
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([false, game.gameboard]);
            const play = game.play(player1.name, commandInfo);
            expect(play[1]).to.equal(expectedGameboard);
        });

        it('play() should return the gameboard if the command is valid of player2 on play', () => {
            const expectedGameboard = game.gameboard;
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([false, game.gameboard]);
            const play = game.play(player2.name, commandInfo);
            expect(play[1]).to.equal(expectedGameboard);
        });

        it('play() should return the false and the gameboard if the player wants to play but it is not its turn', () => {
            const expected = [false, game.gameboard];
            turn.validating.returns(false);
            const play = game.play(player1.name, commandInfo);
            expect(play).to.deep.equal(expected);
        });

        it('play() should call generateLetter of letterReserveService if placeLetter of letterPlacementService return true', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([true, game.gameboard]);
            game.play(player1.name, commandInfo);
            expect(letterReserveService.generateLetters.called).to.be.true;
        });

        it('play() should call end if the rack of the player1 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([true, game.gameboard]);
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            game.play(player1.name, commandInfo);
            expect(endSpy.called).to.be.true;
        });

        it('play() should call end if the rack of the player2 and the letter reserve is empty on play', () => {
            const endSpy = spy(game, 'end');
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([true, game.gameboard]);
            letterReserveService.isEmpty.returns(true);
            player1.rack = [];
            game.play(player2.name, commandInfo);
            expect(endSpy.called).to.be.true;
        });

        it('play() should call resetSkipCounter and end of turn if the rack of the player1 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([true, game.gameboard]);
            letterReserveService.isEmpty.returns(false);
            game.play(player1.name, commandInfo);
            expect(turn.end.called).to.be.true;
            expect(turn.resetSkipCounter.called).to.be.true;
        });

        it('play() should call resetSkipCounter and end of turn if the rack of the player2 or/and the letter reserve is not empty on play', () => {
            turn.validating.returns(true);
            letterPlacementService.globalCommandVerification.returns([[], null]);
            letterPlacementService.placeLetter.returns([true, game.gameboard]);
            player2.rack = [];
            game.play(player2.name, commandInfo);
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
        const exchange = game.exchange(lettersToExchange, player1.name);
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
        const exchange = game.exchange(lettersToExchange, player2.name);
        expect(exchange).to.not.equal(lettersToExchange);
        expect(turn.end.called).to.be.true;
        expect(oldPlayer1Rack).to.equal(player1.rack);
    });

    it('exchange() should reset skipCounter and end turn of the player on exchange', () => {
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(true);
        game.exchange(lettersToExchange, player1.name);

        expect(turn.resetSkipCounter.called).to.be.true;
        expect(turn.end.called).to.be.true;
    });

    it('exchange() should return an empty array if a player wants to exchange but it is not his turn', () => {
        const lettersToExchange = player1.rack.map((letter) => {
            return letter.value;
        });
        turn.validating.returns(false);
        const exchange = game.exchange(lettersToExchange, player1.name);
        expect(exchange).to.deep.equal([]);
    });

    it('abandon() should called end of game', () => {
        const endSpy = spy(game, 'end');
        game.abandon();
        expect(endSpy.called).to.be.true;
        expect(turn.end.called).to.be.true;
    });
});
