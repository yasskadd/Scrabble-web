/* eslint-disable prettier/prettier */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree } from '@app/classes/trie/letter-tree.class';
import { Word } from '@app/classes/word.class';
import { expect } from 'chai';
import * as fs from 'fs';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';

const jsonDictionary = JSON.parse(fs.readFileSync('@app/../assets/dictionary.json', 'utf8'));

describe('Dictionary Validation Service', () => {
    let dictionaryValidationService: DictionaryValidationService;
    let gameboard: Gameboard;

    let validWord1: Word;
    let validWord2: Word;
    let invalidWord1: Word;
    let invalidWord2: Word;

    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        gameboard = new Gameboard();

        validWord1 = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 1 }, letters: ['b', 'o', 'n', 'j', 'o', 'u', 'r'] }, gameboard);
        validWord2 = new Word(
            { isHorizontal: true, firstCoordinate: { x: 1, y: 3 }, letters: ['c', 'h', 'e', 'v', 'a', 'l', 'i', 'e', 'r'] },
            gameboard,
        );

        invalidWord1 = new Word(
            { isHorizontal: true, firstCoordinate: { x: 1, y: 5 }, letters: ['d', 'i', 'j', 'a', 's', 'd', 'i', 'j', 'a', 's', 'd'] },
            gameboard,
        );
        invalidWord2 = new Word({ isHorizontal: true, firstCoordinate: { x: 1, y: 7 }, letters: ['h', 'h', 'h', 'h', 'h'] }, gameboard);
    });

    it('constructor() should add dictionary words to Set object and Set length should equal json words list', () => {
        expect(dictionaryValidationService.dictionary).to.not.be.null;
        expect(dictionaryValidationService.dictionary).to.have.lengthOf(jsonDictionary.words.length);
    });

    it('checkWordInDictionary() should set word isValid attribute to true if they exist', () => {
        validWord1.isValid = false;
        validWord2.isValid = false;
        const validWords: Word[] = [validWord1, validWord2];
        // eslint-disable-next-line dot-notation
        dictionaryValidationService['checkWordInDictionary'](validWords);
        expect(validWord1.isValid && validWord2.isValid).to.be.true;
    });

    it('checkWordInDictionary() should set word isValid attribute to false if they do not exist', () => {
        invalidWord1.isValid = true;
        invalidWord2.isValid = true;
        const invalidWords: Word[] = [invalidWord1, invalidWord2];
        // eslint-disable-next-line dot-notation
        dictionaryValidationService['checkWordInDictionary'](invalidWords);
        expect(invalidWord1.isValid && invalidWord2).to.be.false;
    });

    it('should return an array if isolateInvalidWords() is called', () => {
        const wordList: Word[] = new Array();
        // eslint-disable-next-line dot-notation
        expect(dictionaryValidationService['isolateInvalidWords'](wordList)).to.be.an('array');
    });

    it('isolateInvalidWords() should filter list of words and return list of invalid words', () => {
        const wordList: Word[] = [validWord1, validWord2, invalidWord2, invalidWord1];
        // eslint-disable-next-line dot-notation
        dictionaryValidationService['checkWordInDictionary'](wordList);
        // eslint-disable-next-line dot-notation
        const invalidWords: Word[] = dictionaryValidationService['isolateInvalidWords'](wordList);
        expect(invalidWords).to.have.lengthOf(2);
        expect(invalidWords).to.include.members([invalidWord1, invalidWord2]);
    });

    it('isolateInvalidWords should return empty list of words if words exist', () => {
        const wordList: Word[] = [validWord1, validWord2];
        // eslint-disable-next-line dot-notation
        dictionaryValidationService['checkWordInDictionary'](wordList);
        // eslint-disable-next-line dot-notation
        const invalidWords: Word[] = dictionaryValidationService['isolateInvalidWords'](wordList);
        expect(invalidWords).to.have.lengthOf(0);
        expect(invalidWords).to.eql([]);
    });

    it('should call isolateInvalidWords and checkWordInDictionary when validateWord is called', () => {
        const spyIsolate = Sinon.spy(dictionaryValidationService, 'isolateInvalidWords' as keyof DictionaryValidationService);
        const spyCheckWord = Sinon.spy(dictionaryValidationService, 'checkWordInDictionary' as keyof DictionaryValidationService);
        dictionaryValidationService.validateWord(validWord1, gameboard);
        expect(spyIsolate.calledOnce && spyCheckWord.calledOnce).to.be.true;
    });

    it('should call calculatePoints() when validateWord is called for each word in the list if there is no invalid words', () => {
        const spyCalculate1 = Sinon.spy(Word.prototype, 'calculateWordPoints');
        dictionaryValidationService.validateWord(validWord1, gameboard);
        expect(spyCalculate1.calledOnce).to.be.true;
    });

    it('should not call calculatePoints() when validateWord() is called if there is at least one invalid word', () => {
        const spyCalculate1 = Sinon.spy(Word.prototype, 'calculateWordPoints');
        dictionaryValidationService.validateWord(invalidWord2, gameboard);
        expect(spyCalculate1.called).to.be.false;
    });

    it('should return correct points number when validateWord() is called and wordList is valid', () => {
        const stubCalculate1 = Sinon.stub(Word.prototype, 'calculateWordPoints');
        const stubCalculate2 = Sinon.stub(Word.prototype, 'calculateWordPoints');
        stubCalculate1.returns(10);
        stubCalculate2.returns(20);
        expect(dictionaryValidationService.validateWord(validWord1, gameboard)).to.equal(10);
        expect(dictionaryValidationService.validateWord(validWord2, gameboard)).to.equal(20);
    });

    it('should return 0 points when validateWord() is called and wordList is invalid', () => {
        expect(dictionaryValidationService.validateWord(invalidWord1, gameboard)).to.equal(0);
    });

    context('Trie Dictionary tests', () => {
        let trie: LetterTree;
        before(() => {
            dictionaryValidationService = new DictionaryValidationService();
            dictionaryValidationService['createTrieDictionary']();
            trie = dictionaryValidationService.trie;
        });

        it('should initialize trie', () => {
            expect(trie).to.not.equal(null);
        });

        it('trie should contain existing word from French dictionary', () => {
            expect(trie.isWord('conforme')).to.equal(true);
            expect(trie.isWord('matrice')).to.equal(true);
        });

        it('trie should not contain non-existing word from the French dictionary', () => {
            expect(trie.isWord('dijasdij')).to.equal(false);
            expect(trie.isWord('ocas')).to.equal(false);
        });

        it('should insert word into trie', () => {
            trie.insertWord('dijasdij');
            expect(trie.isWord('dijasdij')).to.equal(true);
        });
    });
});
