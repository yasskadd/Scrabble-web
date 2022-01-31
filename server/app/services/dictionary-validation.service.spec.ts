import { Word } from 'app/classes/word.class';
import { DictionaryValidationService } from './dictionary-validation.service';

describe('Dictionary Validation Service', () => {
    let dictionaryValidationService: DictionaryValidationService;
    let invalidWord: Word;

    it('constructor() should add dictionary words to Set object');
    it('checkWordInDictionary() should modify boolean isValid to false if word cannot be found in dictionary');
    it('checkWordInDictionary() should modify boolean isValid to true if word exists in dictionary');
    it('isolateInvalidWords() should return proper array of strings');
    // Unsure of what I'm supposed to test bellow
    it('validateWords() should call calculatePoints() if all words are valid');
    it('validateWords() should end turn if all words are valid');
    it('validateWords() should call removeLetters() if at least one word is invalid');
});
