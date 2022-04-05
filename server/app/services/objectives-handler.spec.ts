/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Objective } from '@app/classes/objective.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import * as ObjectivesInfo from '@app/constants/objectives';
import { expect } from 'chai';
import * as Sinon from 'sinon';
import { ObjectivesHandler } from './objectives-handler';

describe.only('Objectives Handler Tests', () => {
    let objectivesHandler: ObjectivesHandler;
    let player1: Player;
    let player2: Player;
    let wordStub1: Word;
    let wordStub2: Word;
    let wordStub3: Word;
    let mathRandomStub: Sinon.SinonStub;

    beforeEach(() => {
        mathRandomStub = Sinon.stub(Math, 'random');
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

    afterEach(() => {
        Sinon.restore();
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

    context('isThreeWordsFormed() Tests', () => {
        it('should return true if there is more than 2 words formed', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isThreeWordsFormed'](words)).to.be.equal(true);
        });

        it('should return false if there is 2 words or less formed', () => {
            const wordsList1: Word[] = [wordStub1, wordStub2];
            const wordsList2: Word[] = [wordStub1];
            expect(objectivesHandler['isThreeWordsFormed'](wordsList1) && objectivesHandler['isThreeWordsFormed'](wordsList2)).to.be.equal(false);
        });

        it('should correctly set points to ThreeWords objective', () => {
            wordStub1.points = 20;
            wordStub2.points = 30;
            const words: Word[] = [wordStub1, wordStub2, wordStub1];
            objectivesHandler['isThreeWordsFormed'](words);
            expect(ObjectivesInfo.threeWordsFormed.points).to.be.equal(140);
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

    context('isPalindromicWord() Tests', () => {
        it('should return true if there is one palindromic word in the list', () => {
            const palindromicWord = {} as Word;
            palindromicWord.stringFormat = 'laval';
            const words: Word[] = [wordStub1, palindromicWord, wordStub3];
            expect(objectivesHandler['isPalindromicWord'](words)).to.be.equal(true);
        });

        it('should return false if there is not palindromic word in the list', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isPalindromicWord'](words)).to.be.equal(false);
        });

        it('should return true if there is a palindromic word with uppercase letters', () => {
            const palindromicWord = {} as Word;
            palindromicWord.stringFormat = 'LAval';
            const words: Word[] = [palindromicWord, wordStub2, wordStub3];
            expect(objectivesHandler['isPalindromicWord'](words)).to.be.equal(true);
        });
    });

    context('isWordWithOneVowel() Tests', () => {
        it('should return true if there is one word with one vowel in the list of words', () => {
            const wordWithOneVowel = {} as Word;
            wordWithOneVowel.stringFormat = 'fsdgil';
            const words: Word[] = [wordStub1, wordWithOneVowel, wordStub3];
            expect(objectivesHandler['isWordWithOneVowel'](words)).to.be.equal(true);
        });

        it('should return false if there is no word with only one vowels', () => {
            const words: Word[] = [wordStub1, wordStub2, wordStub3];
            expect(objectivesHandler['isWordWithOneVowel'](words)).to.be.equal(false);
        });

        it('should return true if the only vowel in the word is uppercase', () => {
            const wordWithOneVowel = {} as Word;
            wordWithOneVowel.stringFormat = 'sphYnx';
            const words: Word[] = [wordStub1, wordWithOneVowel, wordStub3];
            expect(objectivesHandler['isWordWithOneVowel'](words)).to.be.equal(true);
        });

        it('should correctly set points to one vowel objective', () => {
            const wordWithOneVowel = {} as Word;
            wordWithOneVowel.stringFormat = 'sphYnx';
            wordWithOneVowel.points = 10;
            const words: Word[] = [wordStub1, wordWithOneVowel, wordStub3];
            objectivesHandler['isWordWithOneVowel'](words);
            expect(ObjectivesInfo.oneVowelWord.points).to.be.equal(20);
        });
    });

    it('setMapObjectives() should correctly set objectives to map with the corresponding function', () => {
        objectivesHandler['objectivesMap'].clear();
        objectivesHandler['setMapObjectives']();
        expect(objectivesHandler['objectivesMap'].size).to.be.equal(6);
    });

    it('addObjectivePoints() should correctly set points to player', () => {
        const oneVowelObjective = ObjectivesInfo.oneVowelWord;
        player1.score = 0;
        objectivesHandler['addObjectivePoints'](player1, oneVowelObjective);
        expect(player1.score).to.be.equal(15);
    });

    context('attributeObjectives() Tests', () => {
        beforeEach(() => {
            player1.objectives = [];
            player2.objectives = [];
        });

        it('should attribute 3 objectives to each player', () => {
            objectivesHandler.attributeObjectives(player1, player2);
            expect(player1.objectives.length && player2.objectives.length).to.be.equal(3);
        });

        it('should give 2 public objectives and 1 private objective to the first player', () => {
            objectivesHandler.attributeObjectives(player1, player2);
            expect(player1.objectives[0].isPublic && player1.objectives[1].isPublic).to.be.equal(true);
            expect(player1.objectives[2].isPublic).to.be.equal(false);
        });

        it('should give 2 public objectives and 1 private objective to the second player', () => {
            objectivesHandler.attributeObjectives(player1, player2);
            expect(player2.objectives[0].isPublic && player2.objectives[1].isPublic).to.be.equal(true);
            expect(player2.objectives[2].isPublic).to.be.equal(false);
        });

        it('should give random objectives to each player', () => {
            mathRandomStub.returns(0);
            const expectedObjectivesPlayer1: Objective[] = [
                ObjectivesInfo.oneVowelWord,
                ObjectivesInfo.palindromicWord,
                ObjectivesInfo.alphabeticalWord,
            ];
            const expectedObjectivesPlayer2: Objective[] = [
                ObjectivesInfo.oneVowelWord,
                ObjectivesInfo.palindromicWord,
                ObjectivesInfo.moreThan10Letters,
            ];
            objectivesHandler.attributeObjectives(player1, player2);
            expect(player1.objectives).to.be.eql(expectedObjectivesPlayer1);
            expect(player2.objectives).to.be.eql(expectedObjectivesPlayer2);
        });
    });

    context('completeObjective() Tests', () => {
        beforeEach(() => {
            player1.objectives = [];
            player2.objectives = [];
        });
        it('should remove objective from both player if objective is public', () => {
            mathRandomStub.returns(0);
            objectivesHandler.attributeObjectives(player1, player2);
            objectivesHandler['completeObjective'](player1, ObjectivesInfo.oneVowelWord);
            expect(player1.objectives.length && player2.objectives.length).to.be.equal(2);
        });

        it('should remove objective to only player passed as parameter if objective if private', () => {
            mathRandomStub.returns(0);
            objectivesHandler.attributeObjectives(player1, player2);
            objectivesHandler['completeObjective'](player1, ObjectivesInfo.alphabeticalWord);
            expect(player1.objectives.length).to.be.equal(2);
            expect(player2.objectives.length).to.be.equal(3);
        });
    });

    context('verifyWordRelatedObjectives() Tests', () => {
        let spyCompleteObjectives: Sinon.SinonSpy;
        beforeEach(() => {
            player1.objectives = [];
            player2.objectives = [];
            spyCompleteObjectives = Sinon.spy(objectivesHandler, 'completeObjective' as keyof ObjectivesHandler);
        });
        it('should call completeObjective 1 time if player formed palindromic word', () => {
            const palindromicWord = {} as Word;
            palindromicWord.stringFormat = 'laval';
            const words: Word[] = [wordStub1, wordStub2, palindromicWord];
            mathRandomStub.returns(0);
            objectivesHandler.attributeObjectives(player1, player2);
            objectivesHandler.verifyWordRelatedObjectives(words, player1);
            expect(spyCompleteObjectives.calledOnceWith(player1, ObjectivesInfo.palindromicWord)).to.be.equal(true);
        });
    });
});
