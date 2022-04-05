/* eslint-disable dot-notation */
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { expect } from 'chai';
import { ObjectivesHandler } from './objectives-handler';

describe.only('Objectives Handler Tests', () => {
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

    context('isSameWordTwoTimes() tests', () => {
        it('should return false if all words are different', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isSameWordTwoTimes'](words)).to.be.equal(false);
        });

        it('should return true if there is two times the same word', () => {
            const words: Word[] = [wordStub1, wordStub1, wordStub2];
            expect(objectivesHandler['isSameWordTwoTimes'](words)).to.be.equal(true);
        });

        it('should return true if there is two times the same words but letters are uppercase', () => {
            const upperCaseWord = {} as Word;
            upperCaseWord.stringFormat = 'BanAne';
            const words: Word[] = [wordStub1, upperCaseWord, wordStub3];
            expect(objectivesHandler['isSameWordTwoTimes'](words)).to.be.equal(true);
        });

        it('should return true if there is more than two times the same words', () => {
            const words: Word[] = [wordStub1, wordStub1, wordStub1];
            expect(objectivesHandler['isSameWordTwoTimes'](words)).to.be.equal(true);
        });
    });

    context('isThereThreeWordsFormed() Tests', () => {
        it('should return true if there is more than 2 words formed', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isThreeWordsFormed'](words)).to.be.equal(true);
        });

        it('should return false if there is 2 words or less formed', () => {
            const wordsList1: Word[] = [wordStub1, wordStub2];
            const wordsList2: Word[] = [wordStub1];
            expect(objectivesHandler['isThreeWordsFormed'](wordsList1) && objectivesHandler['isThreeWordsFormed'](wordsList2)).to.be.equal(false);
        });
    });

    context('isWordMoreThan10Letters() Tests', () => {
        it('should return true if there is a word that has more than 10 letters', () => {
            const wordWithMoreThan10Letters = {} as Word;
            wordWithMoreThan10Letters.stringFormat = 'exceptionnelle';
            const words: Word[] = [wordStub1, wordStub2, wordWithMoreThan10Letters];
            expect(objectivesHandler['isWordMoreThan10Letters'](words)).to.be.equal(true);
        });

        it('should return false if there is no words with more than 10 letters', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isWordMoreThan10Letters'](words)).to.be.equal(false);
        });
    });

    context('isWordAlphabetical() Tests', () => {
        it('should return true if there is an alphabetical word', () => {
            const alphabeticalWord = {} as Word;
            alphabeticalWord.stringFormat = 'acgkmz';
            const words: Word[] = [wordStub1, alphabeticalWord, wordStub3];
            expect(objectivesHandler['isWordAlphabetical'](words)).to.be.equal(true);
        });

        it('should return false if there is no alphabetical words', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isWordAlphabetical'](words)).to.be.equal(false);
        });
    });
});
