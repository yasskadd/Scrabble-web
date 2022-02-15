/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { Letter } from '@common/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { GameboardCoordinate } from './gameboard-coordinate.class';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

describe('Word', () => {
    let word: Word;
    const letterA = {} as Letter;
    const letterB = {} as Letter;
    const letterC = {} as Letter;
    const letterD = {} as Letter;
    let gameboard: Gameboard;
    let boxMultiplierService: BoxMultiplierService;

    beforeEach(async () => {
        letterA.value = 'a';
        letterA.points = 1;
        letterB.value = 'b';
        letterB.points = 2;
        letterC.value = 'c';
        letterC.points = 5;
        letterD.value = 'd';
        letterD.points = 4;
        boxMultiplierService = Container.get(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('stringFormat attribute should be the abc if constructed word is horizontal', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(1, 0, letterB),
            new GameboardCoordinate(2, 0, letterC),
        ];
        word = new Word(true, coordList);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.be.true;
    });

    it('stringFormat attribute should be the abcd if constructed word is vertical', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(3, 3, letterA),
            new GameboardCoordinate(3, 4, letterB),
            new GameboardCoordinate(3, 5, letterC),
            new GameboardCoordinate(3, 6, letterD),
        ];
        word = new Word(false, coordList);
        expect(word.stringFormat).to.eql('abcd');
        expect(word.isFirstWord).to.be.false;
    });

    it('should correctly calculate points if there is no multiplier', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 4, letterA),
            new GameboardCoordinate(1, 4, letterB),
            new GameboardCoordinate(2, 4, letterC),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if there is a letterMultiplier', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 0, letterA),
            new GameboardCoordinate(2, 0, letterB),
            new GameboardCoordinate(3, 0, letterC),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is vertical and on letterMultiplier', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(6, 0, letterA),
            new GameboardCoordinate(6, 1, letterB),
            new GameboardCoordinate(6, 2, letterC),
        ];
        word = new Word(false, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(1, 0, letterB),
            new GameboardCoordinate(2, 0, letterC),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier and is vertical', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(0, 1, letterB),
            new GameboardCoordinate(0, 2, letterC),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a Letter and a word multiplier', () => {
        // eslint-disable-next-line max-len
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 7, letterA),
            new GameboardCoordinate(1, 7, letterB),
            new GameboardCoordinate(2, 7, letterC),
            new GameboardCoordinate(3, 7, letterD),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points + letterD.points * 2) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on two Letter multipliers', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(6, 6, letterA),
            new GameboardCoordinate(7, 6, letterB),
            new GameboardCoordinate(8, 6, letterC),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points * 2 + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should reset wordMultiplier in gameboard after calculating points', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(0, 0, letterA),
            new GameboardCoordinate(1, 0, letterB),
            new GameboardCoordinate(2, 0, letterC),
        ];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new GameboardCoordinate(0, 0, letterA));
        expect(gameboardCoord.wordMultiplier).to.equal(1);
    });

    it('should reset Letter in gameboard after calculating points', () => {
        const coordList: GameboardCoordinate[] = [
            new GameboardCoordinate(1, 0, letterA),
            new GameboardCoordinate(2, 0, letterB),
            new GameboardCoordinate(3, 0, letterC),
        ];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new GameboardCoordinate(3, 0, letterC));
        expect(gameboardCoord.letterMultiplier).to.equal(1);
    });

    it('resetLetterMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: GameboardCoordinate = new GameboardCoordinate(3, 0, letterC);
        const gameboardCoord: GameboardCoordinate = gameboard.getCoord(squareMultiplier3);
        const coordList: GameboardCoordinate[] = [new GameboardCoordinate(1, 0, letterA), new GameboardCoordinate(2, 0, letterB), squareMultiplier3];
        const spyReset = Sinon.spy(gameboardCoord, 'resetLetterMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.calledOnce(spyReset);
    });

    it('resetWordMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: GameboardCoordinate = new GameboardCoordinate(0, 0, letterA);
        const gameboardCoord: GameboardCoordinate = gameboard.getCoord(squareMultiplier3);
        const coordList: GameboardCoordinate[] = [squareMultiplier3, new GameboardCoordinate(1, 0, letterB), new GameboardCoordinate(2, 0, letterC)];
        const spyReset = Sinon.spy(gameboardCoord, 'resetWordMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.called(spyReset);
    });
});
