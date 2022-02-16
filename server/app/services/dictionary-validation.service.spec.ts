/* eslint-disable prettier/prettier */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-restricted-imports */
import { Word } from '@app/classes/word.class';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { expect } from 'chai';
import * as fs from 'fs';
import * as Sinon from 'sinon';
import { DictionaryValidationService } from './dictionary-validation.service';

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8'));

describe.only('Dictionary Validation Service', () => {
    let dictionaryValidationService: DictionaryValidationService;
    let validWord1: Word;
    let validWord2: Word;
    let invalidWord1: Word;
    let invalidWord2: Word;
    // let wordClass: Word;

    beforeEach(() => {
        dictionaryValidationService = new DictionaryValidationService();
        const letterA = { points: 5 } as Letter;
        validWord1 = new Word(true, [new LetterTile(1, 1, letterA), new LetterTile(1, 2, letterA)]);
        validWord1.stringFormat = 'bonjour';
        validWord2 = new Word(true, [new LetterTile(2, 2, letterA), new LetterTile(2, 3, letterA)]);
        validWord2.stringFormat = 'chevalier';
        invalidWord1 = {} as Word;
        invalidWord1.stringFormat = 'dijasdijasd';
        invalidWord2 = {} as Word;
        invalidWord2.stringFormat = 'hhhhh';
    });

    it('constructor() should add dictionary words to Set object and Set length should equal json words list', () => {
        expect(dictionaryValidationService.dictionary).to.not.be.null;
        const jsonWordsLength: number = jsonDictionary.words.length;
        expect(dictionaryValidationService.dictionary).to.have.lengthOf(jsonWordsLength);
    });

    it('checkWordInDictionary() should set word isValid attribute to true if they exist', () => {
        validWord1.isValid = false;
        validWord2.isValid = false;
        const validWords: Word[] = [validWord1, validWord2];
        dictionaryValidationService['checkWordInDictionary'](validWords);
        expect(validWord1.isValid && validWord2.isValid).to.be.true;
    });

    it('checkWordInDictionary() should set word isValid attribute to false if they do not exist', () => {
        invalidWord1.isValid = true;
        invalidWord2.isValid = true;
        const invalidWords: Word[] = [invalidWord1, invalidWord2];
        dictionaryValidationService['checkWordInDictionary'](invalidWords);
        expect(invalidWord1.isValid && invalidWord2).to.be.false;
    });

    it('should return an array if isolateInvalidWords() is called', () => {
        const wordList: Word[] = new Array();
        expect(dictionaryValidationService['isolateInvalidWords'](wordList)).to.be.an('array');
    });

    it('isolateInvalidWords() should filter list of words and return list of invalid words', () => {
        const wordList: Word[] = [validWord1, validWord2, invalidWord2, invalidWord1];
        dictionaryValidationService['checkWordInDictionary'](wordList);
        const invalidWords: Word[] = dictionaryValidationService['isolateInvalidWords'](wordList);
        expect(invalidWords).to.have.lengthOf(2);
        expect(invalidWords).to.include.members([invalidWord1, invalidWord2]);
    });

    it('isolateInvalidWords should return empty list of words if words exist', () => {
        const wordList: Word[] = [validWord1, validWord2];
        dictionaryValidationService['checkWordInDictionary'](wordList);
        const invalidWords: Word[] = dictionaryValidationService['isolateInvalidWords'](wordList);
        expect(invalidWords).to.have.lengthOf(0);
        expect(invalidWords).to.eql([]);
    });

    it('should call isolateInvalidWords and checkWordInDictionary when validateWord is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyIsolate = Sinon.spy(dictionaryValidationService, 'isolateInvalidWords' as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyCheckWord = Sinon.spy(dictionaryValidationService, 'checkWordInDictionary' as any);
        const wordList: Word[] = [validWord1, validWord2];
        dictionaryValidationService.validateWords(wordList);
        expect(spyIsolate.calledOnce && spyCheckWord.calledOnce).to.be.true;
    });

    it('should call calculatePoints() when validateWord is called for each word in the list if there is no invalid words', () => {
        const spyCalculate1 = Sinon.spy(validWord1, 'calculatePoints');
        const spyCalculate2 = Sinon.spy(validWord2, 'calculatePoints');
        const validWordList = [validWord1, validWord2];
        dictionaryValidationService.validateWords(validWordList);
        expect(spyCalculate1.calledOnce && spyCalculate2.calledOnce).to.be.true;
    });

    it('should not call calculatePoints() when validateWord() is called if there is at least one invalid word', () => {
        const spyCalculate1 = Sinon.spy(validWord1, 'calculatePoints');
        const wordList = [validWord1, validWord2, invalidWord2];
        dictionaryValidationService.validateWords(wordList);
        expect(spyCalculate1.called).to.be.false;
    });

    it('should return correct points number when validateWord() is called and wordList is valid', () => {
        const stubCalculate1 = Sinon.stub(validWord1, 'calculatePoints');
        const stubCalculate2 = Sinon.stub(validWord2, 'calculatePoints');
        stubCalculate1.returns(10);
        stubCalculate2.returns(20);
        const wordList = [validWord1, validWord2];
        expect(dictionaryValidationService.validateWords(wordList)).to.equal(30);
    });

    it('should return 0 points when validateWord() is called and wordList is invalid', () => {
        const wordList = [validWord1, validWord2, invalidWord1];
        expect(dictionaryValidationService.validateWords(wordList)).to.equal(0);
    });
});
