/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { Game } from '@app/services/game.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { LetterTile } from '@common/classes/letter-tile.class';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { BeginnerBot, BotInformation } from './bot-beginner.class';

describe.only('BotBeginner', () => {
    let botBeginner: BeginnerBot;
    let gameStub: Sinon.SinonStubbedInstance<Game> & Game;
    let botInfo: BotInformation;
    let wordSolverStub: Sinon.SinonStubbedInstance<WordSolverService> & WordSolverService;
    let stubMathRandom: Sinon.SinonStub<[], number>;
    before(() => {
        stubMathRandom = Sinon.stub(Math, 'random');
    });

    beforeEach(() => {
        wordSolverStub = Sinon.createStubInstance(WordSolverService) as Sinon.SinonStubbedInstance<WordSolverService> & WordSolverService;
        gameStub = Sinon.createStubInstance(Game) as Sinon.SinonStubbedInstance<Game> & Game;
        botInfo = { game: gameStub, socketManager: Container.get(SocketManager), roomId: 'testRoom' };
        botBeginner = new BeginnerBot(wordSolverStub, true, 'robot', botInfo);
    });

    context('inRange() tests', () => {
        let START: number;
        let END: number;
        const END_VALUE = 5;
        const VALUE_NOT_IN_RANGE = 10;
        beforeEach(() => {
            START = 0;
            END = END_VALUE;
        });

        it('should return true if the number passed as a parameter is in range', () => {
            expect(botBeginner['inRange'](1, START, END)).to.equal(true);
        });

        it('should return true if number passed as a parameter is equal to START', () => {
            expect(botBeginner['inRange'](START, START, END)).to.equal(true);
        });

        it('should return true if number passed as a parameter is equal to END', () => {
            expect(botBeginner['inRange'](END_VALUE, START, END)).to.equal(true);
        });

        it('should return false if number passed as a parameter is not in range', () => {
            expect(botBeginner['inRange'](VALUE_NOT_IN_RANGE, START, END)).to.equal(false);
        });

        it('should return false if number passed as a parameter is not in range and is negative', () => {
            expect(botBeginner['inRange'](-VALUE_NOT_IN_RANGE, START, END)).to.equal(false);
        });
    });

    it('getRandomNumber() should return correct number depending on the max number passed as a parameter', () => {
        const MAX_NUMBER = 10;
        const MATH_RANDOM_RETURN = 0.5;
        const EXPECTED_RESULT = 6;
        stubMathRandom.returns(MATH_RANDOM_RETURN);
        expect(botBeginner['getRandomNumber'](MAX_NUMBER)).to.equal(EXPECTED_RESULT);
    });

    context('choosePlayMove() tests', () => {
        let spySkipTurn: Sinon.SinonSpy<[], void>;
        let spyExchangerLetters: Sinon.SinonSpy<[], void>;
        let spyPlaceLetter: Sinon.SinonSpy<[], string | [boolean, Gameboard]>;
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        beforeEach(() => {
            spySkipTurn = Sinon.spy(botBeginner, 'skipTurn');
            spyExchangerLetters = Sinon.spy(botBeginner, 'exchangeLetter');
            spyPlaceLetter = Sinon.spy(botBeginner, 'placeLetter');
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as keyof BeginnerBot);
        });

        it('should call skipTurn() if random number is equal to 1', () => {
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            expect(spySkipTurn.calledOnce).to.equal(true);
        });

        it('should not call skipTurn() and placeLetter() if random number is not equal to 1', () => {
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            expect(spySkipTurn.called && spyPlaceLetter.called).to.equal(false);
        });

        it('should call exchangeLetter() if random number is equal to 2', () => {
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            expect(spyExchangerLetters.calledOnce).to.equal(true);
        });

        it('should not call exchangeLetters() and placeLetter() if random number is not equal to 2', () => {
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            expect(spyExchangerLetters.called && spyPlaceLetter.called).to.equal(false);
        });

        it('should call placeLetter() if random number is between 3 and 10', () => {
            stubGetRandom.returns(3);
            botBeginner.choosePlayMove();
            expect(spyPlaceLetter.calledOnce).to.equal(true);
        });
    });

    context.only('exchangeLetters() tests', () => {
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        let mockSocketManager: Sinon.SinonMock;
        beforeEach(() => {
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as keyof BeginnerBot);
            botBeginner.rack = [{ value: 'a' } as Letter, { value: 'b' } as Letter, { value: 'c' } as Letter];
            mockSocketManager = Sinon.mock(botBeginner['botInfo'].socketManager);
        });
        it.only('should call game.exchange() with correct letters to exchange and this parameter', () => {
            stubGetRandom.onFirstCall().returns(2);
            stubGetRandom.returns(1);
            const expectedRack: string[] = ['a', 'b'];
            const expectation = mockSocketManager.expects('emitRoom');
            expectation.withArgs(botBeginner['botInfo'].roomId);
            botBeginner.exchangeLetter();
            mockSocketManager.verify();
            expect(gameStub.exchange.calledOnceWithExactly(expectedRack, botBeginner)).to.equal(true);
        });

        it.only('should not call game.exchange() if this.game is undefined', () => {
            botBeginner.game = undefined as never;
            expect(gameStub.exchange.called).to.equal(false);
        });
    });

    context.only('skipTurn() tests', () => {
        let mockSocketManager: Sinon.SinonMock;
        beforeEach(() => {
            mockSocketManager = Sinon.mock(botBeginner['botInfo'].socketManager);
        });

        afterEach(() => {
            mockSocketManager.restore();
        });

        it.only('should not call game.skip() if game is undefined', () => {
            const expectation = mockSocketManager.expects('emitRoom').never();
            botBeginner.game = undefined as never;
            botBeginner.skipTurn();
            expectation.verify();
            expect(gameStub.skip.called).to.equal(false);
        });

        it.only('should call game.skip() with correct name as an argument if game is not undefined', () => {
            const expectation = mockSocketManager.expects('emitRoom').exactly(1).withArgs(botBeginner['botInfo'].roomId);
            botBeginner.skipTurn();
            expectation.verify();
            expect(gameStub.skip.calledOnce).to.equal(true);
        });
    });

    context.only('emitPlacementCommand() tests', () => {
        it.only('should emitRoom() with correct arguments', () => {
            const commandInfoStub: CommandInfo = {
                firstCoordinate: new LetterTile(1, 1, {} as Letter),
                direction: 'h',
                lettersPlaced: ['t', 'e', 's', 't'],
            };
            const expectedCommand = 'a1h test';
            const mockSocketManager = Sinon.mock(botBeginner['botInfo'].socketManager);
            const expectation = mockSocketManager.expects('emitRoom').exactly(1);
            expectation.withExactArgs(botBeginner['botInfo'].roomId, SocketEvents.GameMessage, expectedCommand);
            botBeginner['emitPlaceCommand'](commandInfoStub);
            expectation.verify();
        });
    });

    context.only('addCommandInfoToList() tests', () => {
        let commandInfoMapStub: Map<CommandInfo, number>;
        beforeEach(() => {
            commandInfoMapStub = new Map();
        });

        it.only('should add commandInfo to list with random number being 3 and commandInfo score in range from 1 to 6', () => {
            const RANDOM_NUMBER = 3;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 6);
            commandInfoMapStub.set({} as CommandInfo, 8);
            const commandInfoList: CommandInfo[] = new Array();
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, commandInfoList, RANDOM_NUMBER).length).to.equal(3);
        });

        it.only('should add commandInfo to list with random number being 6 and commandInfo score in range from 7 to 12', () => {
            const RANDOM_NUMBER = 6;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 7);
            commandInfoMapStub.set({} as CommandInfo, 12);
            const commandInfoList: CommandInfo[] = new Array();
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, commandInfoList, RANDOM_NUMBER).length).to.equal(2);
        });

        it.only('should add commandInfo to list with random number being 8 and commandInfo score in range from 13 to 18', () => {
            const RANDOM_NUMBER = 8;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 7);
            commandInfoMapStub.set({} as CommandInfo, 15);
            const commandInfoList: CommandInfo[] = new Array();
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, commandInfoList, RANDOM_NUMBER).length).to.equal(1);
        });
    });

    context();
});
