/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import { Word } from '@app/classes/word.class';
import { GameBoard } from 'app/classes/gameboard.class';
import { Container, Service } from 'typedi';
import * as jsonDictionary from '../../assets/dictionnary.json';
import { BoxMultiplier } from './box-multiplier.service';

@Service()
export class DictionaryValidationService {
    dictionary: Set<string> = new Set();
    gameboard: GameBoard = new GameBoard(Container.get(BoxMultiplier)); // not sure if this is good

    constructor() {
        jsonDictionary.words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    validateWords(enteredWords: Word[]): number {
        this.checkWordInDictionary(enteredWords);
        const invalidWords = this.isolateInvalidWords(enteredWords);
        let roundPoints = 0;
        if (invalidWords.length === 0) {
            // TODO : calculatePoints() + endTurn()
            enteredWords.forEach((word: Word) => {
                roundPoints += word.calculatePoints(this.gameboard);
                // roundPoints += points;
                // console.log('CALLED');
                // end turn
            });
            return roundPoints;
        } else {
            // TODO : flash invalideWords red and removeLetters();
            return roundPoints;
        }
    }

    private checkWordInDictionary(wordList: Word[]): void {
        wordList.forEach((word) => {
            if (!this.dictionary.has(word.stringFormat)) {
                word.isValid = false;
            } else {
                word.isValid = true;
            }
        });
    }

    private isolateInvalidWords(enteredWords: Word[]) {
        return enteredWords.filter((word) => word.isValid === false);
    }
}
