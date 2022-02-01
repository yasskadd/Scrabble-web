import { GameBoard } from 'app/classes/gameboard.class';
import { Service } from 'typedi';
import * as jsonDictionnary from '../../assets/dictionary.json';
import { Word } from '../classes/word.class';

@Service()
export class DictionaryValidationService {
    dictionary: Set<string>;
    gameboard: GameBoard; // not sure if this is good

    constructor() {
        (<unknown>jsonDictionnary).words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    validateWords(enteredWords: Word[]): void {
        this.checkWordInDictionary(enteredWords);
        const invalidWords = this.isolateInvalidWords(enteredWords);

        if (!invalidWords) {
            // TODO : calculatePoints() + endTurn()
            let newPoints = 0;
            enteredWords.forEach((word: Word) => {
                newPoints += word.calculatePoints(word, this.gameboard);
                // end turn
            });
        } else {
            // TODO : flash invalideWords red and removeLetters();
        }
    }

    checkWordInDictionary(enteredWords: Word[]): void {
        enteredWords.forEach((enteredWord) => {
            if (!this.dictionary.has(enteredWord.stringFormat)) {
                enteredWord.isValid = false;
                console.log(enteredWord + 'is not valid');
            } else {
                enteredWord.isValid = true;
                console.log(enteredWord + 'is not valid');
            }
        });
    }

    isolateInvalidWords(enteredWords: Word[]) {
        return enteredWords.filter((word) => {
            word.isValid = false;
        });
    }
}
