/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Player } from '@app/classes/player';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import { GameService } from './game.service';
import { LetterReserveService } from './letter-reserve.service';
import { TurnService } from './turn.service';

describe('GameService', () => {
    let gameService: GameService;
    let player1: Player;
    let player2: Player;
    let turnService: SinonStubbedInstance<TurnService> & TurnService;
    let letterReserveService: SinonStubbedInstance<LetterReserveService>;

    beforeEach(() => {
        player1 = new Player('player1');
        player2 = new Player('player2');
        turnService = createStubInstance(TurnService) as SinonStubbedInstance<TurnService> & TurnService;
        letterReserveService = createStubInstance(LetterReserveService);
        gameService = new GameService(player1, player2, turnService, letterReserveService);
    });

    it('start() should called generateLetter of letterReserveService two times and called determinePlayer and start of turnService ', () => {
        gameService.start();
        expect(letterReserveService.generateLetters.callCount).to.equal(2);
        expect(turnService.determinePlayer.called).to.be.true;
        expect(turnService.start.called).to.be.true;
    });

    it('end() should called end of turnService', () => {
        gameService.end();
        expect(turnService.end.called).to.be.true;
    });

    it('skip() should return false if no player has skipped', () => {
        const skip = gameService.skip('undefined');
        // turnService.validating.callsFake(() => {
        //     return true;
        // });
        expect(skip).to.be.false;
    });

    it('skip() should return true and end turn of player1 if he has skipped', () => {
        turnService.validating.returns(true);
        const skip = gameService.skip(player1.name);
        expect(skip).to.be.true;
        expect(turnService.end.called).to.be.true;
    });

    it('skip() should return true and end turn of player2 if he has skipped', () => {
        turnService.validating.returns(true);
        const skip = gameService.skip(player2.name);
        expect(skip).to.be.true;
        expect(turnService.end.called).to.be.true;
    });

    it('skip() should return false if player1 wants to skip but it is not his turn', () => {
        turnService.validating.returns(false);
        const skip = gameService.skip(player1.name);
        expect(skip).to.be.false;
        expect(turnService.end.called).to.be.false;
    });

    it('abandon() should called end of gameService', () => {
        const spyEnd = spy(gameService, 'end');
        gameService.abandon();
        expect(spyEnd.called).to.be.true;
        expect(turnService.end.called).to.be.true;
    });
});
