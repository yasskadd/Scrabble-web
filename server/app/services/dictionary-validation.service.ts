import { Service } from 'typedi';
import * as jsonDictionnary from '../../assets/dictionary.json';
import { Word } from '../classes/word';

@Service()
export class DictionaryValidationService {
    dictionary: Set<string>;

    /**
     * Adds all dictionnary words from a json file into a Set object.
     * @dictionaryLanguage
     *
     * N.B. : Using a Set later allows to check if a word exists
     * in the dictionnary with a time-complexity of O(n)
     */
    constructor() {
        (<any>jsonDictionnary).words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    /**
     * Check if newly placed letters on the gameboard form valid words
     * (i.e. words that are present in the dictionary)
     * @enteredWords represents newly formed words on the gameboard
     */
    validateWords(enteredWords: Array<Word>): void {
        enteredWords.forEach((enteredWord) => {
            if (!this.dictionary.has(enteredWord.stringFormat)) {
                enteredWord.isValid = false;
                console.log(enteredWord + 'is not valid');
            } else {
                enteredWord.isValid = true;
                console.log(enteredWord + 'is not valid');
            }
        });

        const invalidWords = enteredWords.filter((word) => {
            word.isValid = false;
        });

        if (!invalidWords) {
            // TODO : calculatePoints() + endTurn()
        } else {
            // TODO : flash invalideWords red and removeLetters();
        }
    }
}
