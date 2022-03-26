/* eslint-disable dot-notation */
import { Game } from '@app/classes/game';
import { LetterReserve } from '@app/classes/letter-reserve';
import { Turn } from '@app/classes/turn';
import { BotInformation } from '@app/interfaces/bot-information';
import { WordSolverService } from '@app/services/word-solver.service';
import { CommandInfo } from '@common/interfaces/command-info';
import { expect } from 'chai';
import { ReplaySubject } from 'rxjs';
import * as Sinon from 'sinon';
import { ExpertBot } from './expert-bot.class';

describe.only('Expert Bot Tests', () => {
    let expertBot: ExpertBot;
    let gameStub: Sinon.SinonStubbedInstance<Game> & Game;
    let botInfo: BotInformation;
    let wordSolverStub: Sinon.SinonStubbedInstance<WordSolverService>;
    beforeEach(() => {
        gameStub = Sinon.createStubInstance(Game) as Sinon.SinonStubbedInstance<Game> & Game;
        gameStub.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        botInfo = { timer: 60, roomId: 'testRoom' };
        expertBot = new ExpertBot(true, 'robot', botInfo);
        wordSolverStub = Sinon.createStubInstance(WordSolverService);
        expertBot['wordSolver'] = wordSolverStub as never;
        expertBot.setGame(gameStub);
        expertBot['game'].letterReserve = new LetterReserve();
    });

    context('play Tests', () => {
        let spyExchangeLetters: Sinon.SinonSpy;
        let mockEmitPlaceCommand: Sinon.SinonExpectation;
        let mockEmitRoom: Sinon.SinonExpectation;
        beforeEach(() => {
            spyExchangeLetters = Sinon.spy(expertBot, 'exchangeLetters');
            mockEmitPlaceCommand = Sinon.mock(expertBot).expects('emitPlaceCommand');
            mockEmitRoom = Sinon.mock(expertBot['socketManager']).expects('emitRoom');
        });

        afterEach(() => {
            Sinon.restore();
        });

        it('should call exchangeLetters() and not EmitPlaceCommand() if there is no existing commandInfo', () => {
            const undefinedCommandInfo = undefined as never;
            expertBot.play(undefinedCommandInfo);
            mockEmitPlaceCommand.never().verify();
            mockEmitRoom.exactly(1).verify();
            expect(spyExchangeLetters.calledOnce).to.be.equal(true);
        });

        it('should call EmitPlaceCommand() and not exchangeLetters() if CommandInfo is not undefined', () => {
            const commandInfoStub = {} as CommandInfo;
            expertBot.play(commandInfoStub);
            mockEmitPlaceCommand.exactly(1).withExactArgs(commandInfoStub).verify();
            expect(spyExchangeLetters.called).to.be.equal(false);
        });
    });

    context('exchangeLetters() tests', () => {});
});
