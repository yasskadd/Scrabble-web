/* eslint-disable dot-notation */
import { Game } from '@app/services/game.service';
import { expect } from 'chai';
import { BeginnerBot } from './bot-beginner.class';
import Sinon = require('sinon');

describe.only('BotBeginner', () => {
    let botBeginner: BeginnerBot;
    let gameStub: Game;
    beforeEach(() => {
        gameStub = {} as Game;
        botBeginner = new BeginnerBot(gameStub, true, 'robot');
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

        it.only('should return true if the number passed as a parameter is in range', () => {
            expect(botBeginner['inRange'](1, START, END)).to.equal(true);
        });

        it.only('should return true if number passed as a parameter is equal to START', () => {
            expect(botBeginner['inRange'](START, START, END)).to.equal(true);
        });

        it.only('should return true if number passed as a parameter is equal to END', () => {
            expect(botBeginner['inRange'](END_VALUE, START, END)).to.equal(true);
        });

        it.only('should return false if number passed as a parameter is not in range', () => {
            expect(botBeginner['inRange'](VALUE_NOT_IN_RANGE, START, END)).to.equal(false);
        });

        it.only('should return false if number passed as a parameter is not in range and is negative', () => {
            expect(botBeginner['inRange'](-VALUE_NOT_IN_RANGE, START, END)).to.equal(false);
        });
    });

    it.only('getRandomNumber() should return correct number depending on the max number passed as a parameter', () => {
        const MAX_NUMBER = 10;
        const MATH_RANDOM_RETURN = 0.5;
        const EXPECTED_RESULT = 6;
        const stubMathRandom = Sinon.stub(Math, 'random');
        stubMathRandom.returns(MATH_RANDOM_RETURN);
        expect(botBeginner['getRandomNumber'](MAX_NUMBER)).to.equal(EXPECTED_RESULT);
    });

    context('choosePlayMove() tests', () => {
        beforeEach(() => {});
    });
});
