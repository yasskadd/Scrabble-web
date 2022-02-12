import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { expect } from 'chai';
import * as fs from 'fs';
import { Container } from 'typedi';
import { BoxMultiplierService } from './box-multiplier.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { ScoreService } from './score.service';
import Sinon = require('sinon');

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/letter-reserve.json', 'utf8'));

describe.only('Dictionary Validation Service', () => {
    let dictionaryValidationService: DictionaryValidationService;
    let boxMultiplierService: BoxMultiplierService;
    let scoreService: ScoreService;

    let gameboard: Gameboard;

    let validWord1: Word;
    let validWord2: Word;
    let invalidWord1: Word;
    let invalidWord2: Word;

    beforeEach(() => {
        dictionaryValidationService = Container.get(DictionaryValidationService);
        gameboard = new Gameboard(boxMultiplierService);

        validWord1 = new Word(false, { x: 1, y: 1 }, 'bonjour', gameboard);
        validWord2 = new Word(false, { x: 3, y: 3 }, 'chevalier', gameboard);

        invalidWord1 = new Word(true, { x: 1, y: 13 }, 'dijasdijasd', gameboard);
        invalidWord2 = new Word(true, { x: 1, y: 15 }, 'hhhhh', gameboard);
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
        const spyIsolate = Sinon.spy(dictionaryValidationService, 'isolateInvalidWords' as any);
        const spyCheckWord = Sinon.spy(dictionaryValidationService, 'checkWordInDictionary' as any);
        dictionaryValidationService.validateWord(validWord1, gameboard);
        expect(spyIsolate.calledOnce && spyCheckWord.calledOnce).to.be.true;
    });

    it('should call calculatePoints() when validateWord is called for each word in the list if there is no invalid words', () => {
        const spyCalculate1 = Sinon.spy(scoreService, 'calculateWordPoints');
        dictionaryValidationService.validateWord(validWord1, gameboard);
        expect(spyCalculate1.calledOnce).to.be.true;
    });

    it('should not call calculatePoints() when validateWord() is called if there is at least one invalid word', () => {
        const spyCalculate1 = Sinon.spy(scoreService, 'calculateWordPoints');
        dictionaryValidationService.validateWord(invalidWord2, gameboard);
        expect(spyCalculate1.called).to.be.false;
    });

    it('should return correct points number when validateWord() is called and wordList is valid', () => {
        const stubCalculate1 = Sinon.stub(scoreService, 'calculateWordPoints');
        const stubCalculate2 = Sinon.stub(scoreService, 'calculateWordPoints');
        stubCalculate1.returns(10);
        stubCalculate2.returns(20);
        expect(dictionaryValidationService.validateWord(validWord1, gameboard)).to.equal(10);
        expect(dictionaryValidationService.validateWord(validWord2, gameboard)).to.equal(20);
    });

    it('should return 0 points when validateWord() is called and wordList is invalid', () => {
        expect(dictionaryValidationService.validateWord(invalidWord1, gameboard)).to.equal(0);
    });
});
