/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/interfaces/command-info';
import { Game } from '@app/services/game.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { LetterTile } from '@common/classes/letter-tile.class';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { ReplaySubject } from 'rxjs';
import * as Sinon from 'sinon';
import { BeginnerBot, BotInformation } from './bot-beginner.class';

describe.only('BotBeginner', () => {
    let botBeginner: BeginnerBot;
    let gameStub: Sinon.SinonStubbedInstance<Game> & Game;
    let botInfo: BotInformation;
    let stubMathRandom: Sinon.SinonStub<[], number>;
    let wordSolverStub: Sinon.SinonStubbedInstance<WordSolverService>;
    let socketManagerStub: Sinon.SinonStubbedInstance<SocketManager>;

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
        socketManagerStub = Sinon.createStubInstance(SocketManager);
        botBeginner['socketManager'] = socketManagerStub as never;
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
        let spySkipTurn: Sinon.SinonSpy<[], void>;
        let spyExchangerLetters: Sinon.SinonSpy<[], void>;
        let stubPlaceLetter: Sinon.SinonStub<[], void>;
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        before(() => {
            spySkipTurn = Sinon.spy(botBeginner, 'skipTurn');
            spyExchangerLetters = Sinon.spy(botBeginner, 'exchangeLetter');
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as never);
            stubPlaceLetter = Sinon.stub(botBeginner, 'placeLetter');
        });

        it('should call skipTurn() if random number is equal to 1', () => {
            botBeginner.setGame(gameStub);
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            setTimeout(() => {
                expect(spySkipTurn.calledOnce).to.equal(true);
            }, 3500);
        });

        it('should not call skipTurn() and placeLetter() if random number is not equal to 1', () => {
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            expect(spySkipTurn.called && stubPlaceLetter.called).to.equal(false);
        });

        it('should call exchangeLetter() if random number is equal to 2', () => {
            stubGetRandom.returns(2);
            botBeginner.choosePlayMove();
            setTimeout(() => {
                expect(spyExchangerLetters.calledOnce).to.equal(true);
            }, 3500);
        });

        it('should not call exchangeLetters() and placeLetter() if random number is not equal to 2', () => {
            stubGetRandom.returns(1);
            botBeginner.choosePlayMove();
            expect(spyExchangerLetters.called && stubPlaceLetter.called).to.equal(false);
        });

        it('should call placeLetter() if random number is between 3 and 10', () => {
            stubGetRandom.returns(3);
            botBeginner.choosePlayMove();
            expect(stubPlaceLetter.calledOnce).to.equal(true);
        });
    });

    context('exchangeLetters() tests', () => {
        let stubGetRandom: Sinon.SinonStub<unknown[], unknown>;
        let mockSocketManager: Sinon.SinonMock;
        beforeEach(() => {
            stubGetRandom = Sinon.stub(botBeginner, 'getRandomNumber' as keyof BeginnerBot);
            botBeginner.rack = [{ value: 'a' } as Letter, { value: 'b' } as Letter, { value: 'c' } as Letter];
            mockSocketManager = Sinon.mock(botBeginner['socketManager']);
            botBeginner.game = gameStub;
        });
        it('should call game.exchange() with correct letters to exchange and this parameter', () => {
            stubGetRandom.onFirstCall().returns(2);
            stubGetRandom.returns(1);
            const expectedRack: string[] = ['a', 'b'];
            mockSocketManager.verify();
            expect(gameStub.exchange.calledOnceWithExactly(expectedRack, botBeginner)).to.equal(true);
        });

        it('should not call game.exchange() if this.game is undefined', () => {
            botBeginner.game = undefined as never;
            expect(gameStub.exchange.called).to.equal(false);
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

    context('emitPlacementCommand() tests', () => {
        it('should emitRoom() with correct arguments', () => {
            botBeginner.setGame(gameStub);
            gameStub.letterReserve = { lettersReserve: [] as Letter[] } as LetterReserveService;
            const commandInfoStub: CommandInfo = {
                firstCoordinate: new LetterTile(1, 1, {} as Letter),
                direction: 'h',
                lettersPlaced: ['t', 'e', 's', 't'],
            };
            const expectedCommand = '!placer a1h test';
            botBeginner['emitPlaceCommand'](commandInfoStub);
            expect(socketManagerStub.emitRoom.calledWithExactly(botBeginner.room, SocketEvents.GameMessage, expectedCommand)).to.equal(true);
            expect(
                socketManagerStub.emitRoom.calledWithExactly(
                    botBeginner.room,
                    SocketEvents.LetterReserveUpdated,
                    gameStub.letterReserve.lettersReserve,
                ),
            ).to.be.equal(true);
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
        let spySkipTurn: Sinon.SinonSpy<[], void>;
        let spyChoosePlayMove: Sinon.SinonSpy<[], void>;
        beforeEach(() => {
            spySkipTurn = Sinon.spy(botBeginner, 'skipTurn');
            spyChoosePlayMove = Sinon.spy(botBeginner, 'choosePlayMove');
            gameStub.turn.activePlayer = botBeginner.name;
            botBeginner.game = gameStub;
        });
        it('should call skipTurn() if 20 seconds have passed in the timer and it is the bot turn', () => {
            botBeginner.start();
            botBeginner.game.turn.countdown.next(40);
            expect(spySkipTurn.calledOnce).to.equal(true);
        });

        it('should not call skipTurn() time passed is not 20 seconds', () => {
            botBeginner.start();
            gameStub.turn.countdown.next(50);
            expect(spySkipTurn.called).to.equal(false);
        });

        it('should not call skipTurn() if it is not the bot turn', () => {
            botBeginner.start();
            gameStub.turn.countdown.next(40);
            gameStub.turn.activePlayer = 'notBotName';
            expect(spySkipTurn.called).to.equal(false);
        });

        it('should reset countUp attribute if it is bot turn', () => {
            botBeginner['countUp'] = 2;
            botBeginner.game.turn.endTurn.next(botBeginner.name);
            expect(botBeginner['countUp']).to.equal(0);
        });

        it('should call choosePlayMove() if it is bot turn', () => {
            botBeginner.start();
            botBeginner.game.turn.endTurn.next(botBeginner.name);
            expect(spyChoosePlayMove.calledOnce).to.equal(true);
        });

        it('should not call choosePlayMove() if it is not botTurn', () => {
            botBeginner.start();
            botBeginner.game.turn.endTurn.next('notBotName');
            expect(spyChoosePlayMove.called).to.equal(false);
        });
    });

    it('processWordSolver() should call setGameboard() and commandInfoScore()', () => {
        botBeginner.setGame(gameStub);
        botBeginner['processWordSolver']();
        expect(wordSolverStub.commandInfoScore.calledOnce && wordSolverStub.setGameboard.calledOnce).to.equal(true);
    });
});
