/* eslint-disable dot-notation */
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { expect } from 'chai';
import { ObjectivesHandler } from './objectives-handler';

describe('Objectives Handler Tests', () => {
    let objectivesHandler: ObjectivesHandler;
    let player1: Player;
    let player2: Player;
    let wordStub1: Word;
    let wordStub2: Word;
    let wordStub3: Word;

    beforeEach(() => {
        player1 = new Player('Rick');
        player2 = new Player('Morty');
        objectivesHandler = new ObjectivesHandler(player1, player2);
        wordStub1 = {} as Word;
        wordStub1.stringFormat = 'banane';
        wordStub2 = {} as Word;
        wordStub2.stringFormat = 'pomme';
        wordStub3 = {} as Word;
        wordStub3.stringFormat = 'raisin';
    });

    context('isSameWordTwoTimes tests', () => {
        it('should return false if all words are different', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub2];
            expect(objectivesHandler['isSameWordTwoTimes'](words)).to.be.equal(false);
        });
    });
});
