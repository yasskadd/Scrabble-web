/* eslint-disable @typescript-eslint/no-magic-numbers */
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { Gameboard } from './gameboard.class';
import { Word } from './word.class';

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
        letterB.points = 3;
        letterC.value = 'c';
        letterC.points = 3;
        letterD.value = 'd';
        letterD.points = 2;
        boxMultiplierService = Container.get(BoxMultiplierService);
        gameboard = new Gameboard(boxMultiplierService);
    });

    it('stringFormat attribute should be the abc if constructed word is horizontal', () => {
        const coordList: LetterTile[] = [new LetterTile(0, 0, letterA), new LetterTile(1, 0, letterB), new LetterTile(2, 0, letterC)];
        word = new Word(true, coordList);
        expect(word.stringFormat).to.eql('abc');
        expect(word.isHorizontal).to.equal(true);
    });

    it('stringFormat attribute should be the abcd if constructed word is vertical', () => {
        const coordList: LetterTile[] = [
            new LetterTile(3, 3, letterA),
            new LetterTile(3, 4, letterB),
            new LetterTile(3, 5, letterC),
            new LetterTile(3, 6, letterD),
        ];
        word = new Word(false, coordList);
        expect(word.stringFormat).to.eql('abcd');
    });

    it('should correctly calculate points if there is no multiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 5, letterA), new LetterTile(2, 5, letterB), new LetterTile(3, 5, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if there is a letterMultiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is vertical and on letterMultiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(7, 1, letterA), new LetterTile(7, 2, letterB), new LetterTile(7, 3, letterC)];
        word = new Word(false, coordList);
        const expectedScore: number = letterA.points + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a word multiplier and is vertical', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterB), new LetterTile(1, 3, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on a Letter and a word multiplier', () => {
        const coordList: LetterTile[] = [
            new LetterTile(1, 8, letterA),
            new LetterTile(2, 8, letterB),
            new LetterTile(3, 8, letterC),
            new LetterTile(4, 8, letterD),
        ];
        word = new Word(true, coordList);
        const expectedScore: number = (letterA.points + letterB.points + letterC.points + letterD.points * 2) * 3;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should correctly calculate points if word is on two Letter multipliers', () => {
        const coordList: LetterTile[] = [new LetterTile(7, 7, letterA), new LetterTile(8, 7, letterB), new LetterTile(9, 7, letterC)];
        word = new Word(true, coordList);
        const expectedScore: number = letterA.points * 2 + letterB.points + letterC.points * 2;
        const score: number = word.calculatePoints(gameboard);
        expect(score).to.equal(expectedScore);
    });

    it('should reset wordMultiplier in gameboard after calculating points', () => {
        const coordList: LetterTile[] = [new LetterTile(1, 1, letterA), new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new LetterTile(1, 1, letterA));
        expect(gameboardCoord.wordMultiplier).to.equal(1);
    });

    it('should reset Letter in gameboard after calculating points', () => {
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), new LetterTile(4, 1, letterC)];
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        const gameboardCoord = gameboard.getCoord(new LetterTile(4, 1, letterC));
        expect(gameboardCoord.letterMultiplier).to.equal(1);
    });

    it('resetLetterMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: LetterTile = new LetterTile(4, 1, letterC);
        const gameboardCoord: LetterTile = gameboard.getCoord(squareMultiplier3);
        const coordList: LetterTile[] = [new LetterTile(2, 1, letterA), new LetterTile(3, 1, letterB), squareMultiplier3];
        const spyReset = Sinon.spy(gameboardCoord, 'resetLetterMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.calledOnce(spyReset);
    });

    it('resetWordMultiplier should be called when points calculation is called', () => {
        const squareMultiplier3: LetterTile = new LetterTile(1, 1, letterA);
        const gameboardCoord: LetterTile = gameboard.getCoord(squareMultiplier3);
        const coordList: LetterTile[] = [squareMultiplier3, new LetterTile(2, 1, letterB), new LetterTile(3, 1, letterC)];
        const spyReset = Sinon.spy(gameboardCoord, 'resetWordMultiplier');
        word = new Word(true, coordList);
        word.calculatePoints(gameboard);
        Sinon.assert.called(spyReset);
    });
});
