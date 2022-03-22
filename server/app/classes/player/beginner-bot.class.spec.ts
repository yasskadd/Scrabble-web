/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Game } from '@app/classes/game';
import { LetterReserve } from '@app/classes/letter-reserve';
import { Turn } from '@app/classes/turn';
import { BotInformation } from '@app/interfaces/bot-information';
import { CommandInfo } from '@app/interfaces/command-info';
import { WordSolverService } from '@app/services/word-solver.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Coordinate } from '@common/interfaces/coordinate';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { ReplaySubject } from 'rxjs';
import * as Sinon from 'sinon';
import { BeginnerBot } from './beginner-bot.class';

describe('BotBeginner', () => {
    let botBeginner: BeginnerBot;
    let gameStub: Sinon.SinonStubbedInstance<Game> & Game;
    let botInfo: BotInformation;
    let stubMathRandom: Sinon.SinonStub<[], number>;
    let wordSolverStub: Sinon.SinonStubbedInstance<WordSolverService>;

    before(() => {
        stubMathRandom = Sinon.stub(Math, 'random');
    });

    beforeEach(() => {
        gameStub = Sinon.createStubInstance(Game) as Sinon.SinonStubbedInstance<Game> & Game;
        gameStub.turn = { countdown: new ReplaySubject(), endTurn: new ReplaySubject() } as Turn;
        botInfo = { timer: 60, roomId: 'testRoom' };
        botBeginner = new BeginnerBot(true, 'robot', botInfo);
        wordSolverStub = Sinon.createStubInstance(WordSolverService);
        botBeginner['wordSolver'] = wordSolverStub as never;
        botBeginner.setGame(gameStub);
    });

    context('setGame() tests', () => {
        beforeEach(() => {
            const turn = new Turn(60);
            gameStub.turn = turn;
        });
        it('setGame() should set game attribute to the game passed as a parameter', () => {
            expect(botBeginner.game).to.not.equal(undefined);
            expect(botBeginner.game).to.eql(gameStub);
        });

        it('setGame() should call choosePlayMove() if it is the bot turn', () => {
            gameStub.turn.activePlayer = botBeginner.name;
            const stubChooseMove = Sinon.stub(botBeginner, 'choosePlayMove');
            botBeginner.setGame(gameStub);
            expect(stubChooseMove.calledOnce).to.equal(true);
        });
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
            gameStub.turn.countdown.next(3);
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
        let mockBot: Sinon.SinonMock;
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        let clock: Sinon.SinonFakeTimers;
        beforeEach(() => {
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as never);
            mockBot = Sinon.mock(botBeginner);
            clock = Sinon.useFakeTimers();
        });

        afterEach(() => {
            mockBot.restore();
            clock.restore();
        });

        it('should call skipTurn() if random number is equal to 1', () => {
            mockBot.expects('skipTurn').exactly(1);
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            clock.tick(3500);
            mockBot.verify();
        });

        it('should not call skipTurn() and placeLetter() if random number is not equal to 1', () => {
            mockBot.expects('skipTurn').never();
            mockBot.expects('placeLetter').never();
            mockBot.expects('exchangeLetter').exactly(1);
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            clock.tick(3500);
            mockBot.verify();
        });

        it('should call exchangeLetter() if random number is equal to 2', () => {
            mockBot.expects('exchangeLetter').exactly(1);
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            clock.tick(3500);
            mockBot.verify();
        });

        it('should not call exchangeLetters() and placeLetter() if random number is equal to 1', () => {
            mockBot.expects('exchangeLetter').never();
            mockBot.expects('placeLetter').never();
            mockBot.expects('skipTurn').exactly(1);
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            clock.tick(3500);
            mockBot.verify();
        });

        it('should call placeLetter() if random number is between 3 and 10', () => {
            mockBot.expects('placeLetter').exactly(1);
            stubGetRandom.returns(3);
            botBeginner.choosePlayMove();
            mockBot.verify();
        });
    });

    context('exchangeLetters() tests', () => {
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        let mockSocketManager: Sinon.SinonMock;
        let stubTotalQuantity: Sinon.SinonStub<[], number>;
        beforeEach(() => {
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as keyof BeginnerBot);
            botBeginner.rack = [{ value: 'a' } as Letter, { value: 'b' } as Letter, { value: 'c' } as Letter];
            mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            botBeginner.setGame(gameStub);
            botBeginner['game'].letterReserve = new LetterReserve();
            stubTotalQuantity = Sinon.stub(botBeginner['game'].letterReserve, 'totalQuantity').returns(20);
        });

        afterEach(() => {
            mockSocketManager.restore();
            Sinon.restore();
        });

        it('should call game.exchange() with correct letters to exchange and this parameter', () => {
            botBeginner['playedTurned'] = false;
            const expectation = mockSocketManager.expects('emitRoom').exactly(1);
            stubGetRandom.onFirstCall().returns(2);
            stubGetRandom.returns(1);
            const expectedRack: string[] = ['a', 'b'];
            botBeginner.exchangeLetter();
            expectation.verify();
            expect(gameStub.exchange.calledOnceWithExactly(expectedRack, botBeginner)).to.equal(true);
        });

        it('should not call game.exchange() if this.game is undefined', () => {
            botBeginner.game = undefined as never;
            botBeginner.exchangeLetter();
            expect(gameStub.exchange.called).to.be.equal(false);
        });

        it('should not call game.exchange() if playedTurn is set to true', () => {
            botBeginner['playedTurned'] = true;
            botBeginner.exchangeLetter();
            expect(gameStub.exchange.called).to.be.equal(false);
        });

        it('should not call game.exchange() if there is less than 7 letters in letterReserve and should skipTurn() after 20 seconds', () => {
            const mockSkipTurn = Sinon.mock(botBeginner).expects('skipTurn').exactly(1);
            const clock = Sinon.useFakeTimers();
            botBeginner['playedTurned'] = false;
            stubTotalQuantity.returns(5);
            botBeginner.game.turn.activePlayer = botBeginner.name;
            botBeginner.start();
            botBeginner.exchangeLetter();
            botBeginner.game.turn.countdown.next(40);
            clock.restore();
            mockSkipTurn.verify();
            botBeginner.game.turn.countdown.unsubscribe();
            expect(gameStub.exchange.called).to.be.equal(false);
        });
    });

    context('skipTurn() tests', () => {
        let mockSocketManager: Sinon.SinonMock;
        beforeEach(() => {
            mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            botBeginner.game = gameStub;
        });

        afterEach(() => {
            mockSocketManager.restore();
        });

        it('should not call game.skip() if game is undefined', () => {
            const expectation = mockSocketManager.expects('emitRoom').never();
            botBeginner.game = undefined as never;
            botBeginner.skipTurn();
            expectation.verify();
            expect(gameStub.skip.called).to.equal(false);
        });

        it('should call game.skip() with correct name as an argument if game is not undefined', () => {
            const expectation = mockSocketManager.expects('emitRoom').exactly(1).withArgs(botBeginner['botInfo'].roomId);
            botBeginner.skipTurn();
            expectation.verify();
            expect(gameStub.skip.calledOnce).to.equal(true);
        });
    });

    context('emitPlacementCommand() tests and placement is horizontal', () => {
        it('should emitRoom() with correct arguments', () => {
            botBeginner.game.letterReserve = new LetterReserve();
            const commandInfoStub: CommandInfo = {
                firstCoordinate: { x: 1, y: 1 } as Coordinate,
                isHorizontal: true,
                letters: ['t', 'e', 's', 't'],
            };
            const expectedCommand = '!placer a1h test';
            const mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            const expectation = mockSocketManager
                .expects('emitRoom')
                .exactly(1)
                .withArgs(botBeginner['botInfo'].roomId, SocketEvents.GameMessage, expectedCommand);
            mockSocketManager
                .expects('emitRoom')
                .exactly(1)
                .withArgs(botBeginner.room, SocketEvents.LetterReserveUpdated, botBeginner['game'].letterReserve.lettersReserve);
            botBeginner['emitPlaceCommand'](commandInfoStub);
            expectation.verify();
            mockSocketManager.restore();
        });

        it('should emitRoom() with correct arguments and placement is vertical', () => {
            botBeginner.game.letterReserve = new LetterReserve();
            const commandInfoStub: CommandInfo = {
                firstCoordinate: { x: 1, y: 1 } as Coordinate,
                isHorizontal: false,
                letters: ['t', 'e', 's', 't'],
            };
            const expectedCommand = '!placer a1v test';
            const mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            const expectation = mockSocketManager
                .expects('emitRoom')
                .exactly(1)
                .withArgs(botBeginner['botInfo'].roomId, SocketEvents.GameMessage, expectedCommand);
            mockSocketManager
                .expects('emitRoom')
                .exactly(1)
                .withArgs(botBeginner.room, SocketEvents.LetterReserveUpdated, botBeginner['game'].letterReserve.lettersReserve);
            botBeginner['emitPlaceCommand'](commandInfoStub);
            expectation.verify();
            mockSocketManager.restore();
        });
    });

    context('addCommandInfoToList() tests', () => {
        let commandInfoMapStub: Map<CommandInfo, number>;
        beforeEach(() => {
            commandInfoMapStub = new Map();
        });

        it('should add commandInfo to list with random number being 3 and commandInfo score in range from 1 to 6', () => {
            const RANDOM_NUMBER = 3;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 6);
            commandInfoMapStub.set({} as CommandInfo, 8);
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, RANDOM_NUMBER).length).to.equal(3);
        });

        it('should add commandInfo to list with random number being 6 and commandInfo score in range from 7 to 12', () => {
            const RANDOM_NUMBER = 6;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 7);
            commandInfoMapStub.set({} as CommandInfo, 12);
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, RANDOM_NUMBER).length).to.equal(2);
        });

        it('should add commandInfo to list with random number being 8 and commandInfo score in range from 13 to 18', () => {
            const RANDOM_NUMBER = 8;
            commandInfoMapStub.set({} as CommandInfo, 1);
            commandInfoMapStub.set({} as CommandInfo, 3);
            commandInfoMapStub.set({} as CommandInfo, 7);
            commandInfoMapStub.set({} as CommandInfo, 15);
            expect(botBeginner['addCommandInfoToList'](commandInfoMapStub, RANDOM_NUMBER).length).to.equal(1);
        });
    });

    context('start() tests with timer of 60 seconds', () => {
        let mockSkip: Sinon.SinonMock;
        beforeEach(() => {
            botBeginner.setGame(gameStub);
            mockSkip = Sinon.mock(botBeginner);
        });

        afterEach(() => {
            Sinon.restore();
            botBeginner['game'].turn.countdown.unsubscribe();
            botBeginner['game'].turn.endTurn.unsubscribe();
            mockSkip.restore();
        });

        it('should call skipTurn() if 20 seconds have passed in the timer and it is the bot turn', () => {
            mockSkip.expects('skipTurn').exactly(1);
            botBeginner['game'].turn.activePlayer = botBeginner.name;
            botBeginner.start();
            botBeginner.game.turn.countdown.next(40);
            mockSkip.verify();
        });

        it('should not call skipTurn() time passed is not 20 seconds', () => {
            mockSkip.expects('skipTurn').never();
            botBeginner['playedTurned'] = false;
            botBeginner.start();
            gameStub.turn.countdown.next(50);
            mockSkip.verify();
        });

        it('should not call skipTurn() if it is not the bot turn', () => {
            mockSkip.expects('skipTurn').never();
            botBeginner.start();
            gameStub.turn.countdown.next(40);
            gameStub.turn.activePlayer = 'notBotName';
            mockSkip.verify();
        });

        it('should reset countUp attribute and call choosePlayMove() if it is bot turn', () => {
            mockSkip.expects('choosePlayMove').exactly(1);
            botBeginner['countUp'] = 2;
            botBeginner.start();
            botBeginner.game.turn.endTurn.next(botBeginner.name);
            mockSkip.verify();
            expect(botBeginner['countUp']).to.equal(0);
        });

        it('should not call choosePlayMove() if it is not botTurn', () => {
            mockSkip.expects('choosePlayMove').never();
            botBeginner.start();
            botBeginner.game.turn.endTurn.next('notBotName');
            mockSkip.verify();
        });
    });

    it('processWordSolver() should call setGameboard() and commandInfoScore()', () => {
        botBeginner.setGame(gameStub);
        botBeginner['processWordSolver']();
        expect(wordSolverStub.commandInfoScore.calledOnce && wordSolverStub.setGameboard.calledOnce).to.equal(true);
    });

    context('play tests', () => {
        let mockGame: Sinon.SinonMock;
        let mockSocketManager: Sinon.SinonMock;
        beforeEach(() => {
            Sinon.restore();
            mockGame = Sinon.mock(botBeginner['game']);
            mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            botBeginner.game.letterReserve = new LetterReserve();
        });

        afterEach(() => {
            mockGame.restore();
            mockSocketManager.restore();
        });

        it('should call skipTurn() if commandInfo is undefined', () => {
            mockGame.expects('skip').exactly(1).calledWithExactly(botBeginner.name);
            mockSocketManager.expects('emitRoom').exactly(1).calledWithExactly(botBeginner.roomId, SocketEvents.GameMessage, '!passer');
            const commandInfoStub = undefined as never;
            const spySkipTurn = Sinon.spy(botBeginner, 'skipTurn');
            botBeginner['play'](commandInfoStub);
            mockGame.verify();
            mockSocketManager.verify();
            expect(spySkipTurn.calledOnce).to.be.equal(true);
        });

        it('should call emitPlaceCommand() if commandInfo is not undefined and playedTurn is set to false', () => {
            const commandInfoStub: CommandInfo = {
                firstCoordinate: { x: 1, y: 1 } as Coordinate,
                isHorizontal: true,
                letters: ['t', 'e', 's', 't'],
            };
            botBeginner['playedTurned'] = false;
            mockGame.expects('play').exactly(1).withExactArgs(botBeginner, commandInfoStub);
            mockSocketManager.expects('emitRoom').exactly(2);
            const spyEmitCommand = Sinon.spy(botBeginner, 'emitPlaceCommand' as keyof BeginnerBot);
            botBeginner['play'](commandInfoStub);
            mockGame.verify();
            mockSocketManager.verify();
            expect(spyEmitCommand.calledOnceWithExactly(commandInfoStub)).to.be.equal(true);
        });
    });

    context('placeLetter() tests', () => {
        let stubCommandInfoToList: Sinon.SinonStub<unknown[], unknown>;
        let mockWordSolver: Sinon.SinonMock;
        let mockBot: Sinon.SinonMock;
        let clock: Sinon.SinonFakeTimers;
        let commandInfoStub: CommandInfo;
        before(() => {
            commandInfoStub = {
                firstCoordinate: { x: 1, y: 1 } as Coordinate,
                isHorizontal: true,
                letters: ['t', 'e', 's', 't'],
            };
        });

        beforeEach(() => {
            Sinon.restore();
            stubCommandInfoToList = Sinon.stub(botBeginner, 'addCommandInfoToList' as keyof BeginnerBot);
            mockWordSolver = Sinon.mock(wordSolverStub);
            mockBot = Sinon.mock(botBeginner);
            clock = Sinon.useFakeTimers();
        });

        afterEach(() => {
            mockWordSolver.restore();
            mockBot.restore();
            clock.restore();
        });

        it('should call skipTurn() after 3 seconds if commandInfoList is empty', () => {
            mockWordSolver.expects('findAllOptions').exactly(1);
            mockWordSolver.expects('commandInfoScore').exactly(1);
            mockBot.expects('skipTurn').exactly(1);
            stubCommandInfoToList.returns([]);
            botBeginner['placeLetter']();
            clock.tick(3500);
            mockBot.verify();
            mockWordSolver.verify();
        });

        it('should call play() if countUp is between 3 and 20 seconds', () => {
            mockBot.expects('play').exactly(1).withExactArgs(commandInfoStub);
            mockWordSolver.expects('findAllOptions').exactly(1);
            mockWordSolver.expects('commandInfoScore').exactly(1);
            stubCommandInfoToList.returns([commandInfoStub]);
            botBeginner['countUp'] = 5;
            botBeginner['placeLetter']();
            mockBot.verify();
            mockWordSolver.verify();
        });

        it('should call play() after a delay if countUp is less than 3 seconds', () => {
            mockBot.expects('play').exactly(1).withExactArgs(commandInfoStub);
            mockWordSolver.expects('findAllOptions').exactly(1);
            mockWordSolver.expects('commandInfoScore').exactly(1);
            stubCommandInfoToList.returns([commandInfoStub]);
            botBeginner['countUp'] = 1;
            botBeginner['placeLetter']();
            clock.tick(3500);
            mockWordSolver.verify();
            mockBot.verify();
        });

        it('should not call play() if countUp is greater than 20 seconds', () => {
            mockBot.expects('play').never();
            mockWordSolver.expects('findAllOptions').exactly(1);
            mockWordSolver.expects('commandInfoScore').exactly(1);
            stubCommandInfoToList.returns([commandInfoStub]);
            botBeginner['countUp'] = 25;
            botBeginner['placeLetter']();
            clock.tick(3500);
            mockWordSolver.verify();
            mockBot.verify();
        });
    });
});
