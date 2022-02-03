/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prettier/prettier */
import { Letter } from '@app/letter';
import { BoxMultiplier } from '@app/services/box-multiplier.service';
import { expect } from 'chai';
import { Container } from 'typedi';
import { Coordinate } from './coordinate.class';
import { GameBoard } from './gameboard.class';
import { Word } from './word.class';
import Sinon = require('sinon');
// eslint-disable-next-line @typescript-eslint/no-require-imports
// import sinon = require('sinon');

describe('Word', () => {
    let word: Word;
    const letterA = new Letter();
    const letterB = new Letter();
    const letterC = new Letter();
    const letterD = new Letter();
    let gameboard: GameBoard;
    let boxMultiplierService: BoxMultiplier;

    beforeEach(async () => {
        letterA.stringChar = 'a';
        letterA.points = 1;
        letterB.stringChar = 'b';
        letterB.points = 2;
        letterC.stringChar = 'c';
        letterC.points = 5;
        letterD.stringChar = 'd';
        letterD.points = 4;
        boxMultiplierService = Container.get(BoxMultiplier);
        gameboard = new GameBoard(boxMultiplierService);
    });

    it('stringFormat attribute should be the abc if constructed word is horizontal', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        word = new Word(true, coordList);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.be.true;
    });

    it('stringFormat attribute should be the abcd if constructed word is vertical', () => {
        const coordList: Coordinate[] = [
            new Coordinate(3, 3, letterA),
            new Coordinate(3, 4, letterB),
            new Coordinate(3, 5, letterC),
            new Coordinate(3, 6, letterD),
        ];
        word = new Word(false, coordList);
        expect(word.stringFormat).to.eql('abcd');
        expect(word.isFirstWord).to.be.false;
    });

    it('should correctly calculate points if there is no multiplier', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 4, letterA), new Coordinate(1, 4, letterB), new Coordinate(2, 4, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if there is a letterMultiplier', () => {
        const coordList: Coordinate[] = [new Coordinate(1, 0, letterA), new Coordinate(2, 0, letterB), new Coordinate(3, 0, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is vertical and on letterMultiplier', () => {
        const coordList: Coordinate[] = [new Coordinate(6, 0, letterA), new Coordinate(6, 1, letterB), new Coordinate(6, 2, letterC)];
        word = new Word(false, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier and is vertical', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(0, 1, letterB), new Coordinate(0, 2, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a letter and a word multiplier', () => {
        // eslint-disable-next-line max-len
        const coordList: Coordinate[] = [
            new Coordinate(0, 7, letterA),
            new Coordinate(1, 7, letterB),
            new Coordinate(2, 7, letterC),
            new Coordinate(3, 7, letterD),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points + letterD.points * 2) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on two letter multipliers', () => {
        const coordList: Coordinate[] = [new Coordinate(6, 6, letterA), new Coordinate(7, 6, letterB), new Coordinate(8, 6, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points * 2 + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should reset wordMultiplier in gameboard after calculating points', () => {
        const coordList: Coordinate[] = [new Coordinate(0, 0, letterA), new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new Coordinate(0, 0, letterA));
        expect(gameboardCoord.wordMultiplier).to.equal(1);
    });

    it('should reset letter in gameboard after calculating points', () => {
        const coordList: Coordinate[] = [new Coordinate(1, 0, letterA), new Coordinate(2, 0, letterB), new Coordinate(3, 0, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new Coordinate(3, 0, letterC));
        expect(gameboardCoord.letterMultiplier).to.equal(1);
    });

    it('resetLetterMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: Coordinate = new Coordinate(3, 0, letterC);
        const gameboardCoord: Coordinate = gameboard.getCoord(squareMultiplier3);
        const coordList: Coordinate[] = [new Coordinate(1, 0, letterA), new Coordinate(2, 0, letterB), squareMultiplier3];
        const spyReset = Sinon.spy(gameboardCoord, 'resetLetterMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.calledOnce(spyReset);
    });

    it('resetWordMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: Coordinate = new Coordinate(0, 0, letterA);
        const gameboardCoord: Coordinate = gameboard.getCoord(squareMultiplier3);
        const coordList: Coordinate[] = [squareMultiplier3, new Coordinate(1, 0, letterB), new Coordinate(2, 0, letterC)];
        const spyReset = Sinon.spy(gameboardCoord, 'resetWordMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.called(spyReset);
    });
});
