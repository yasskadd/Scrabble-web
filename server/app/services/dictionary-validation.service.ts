/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import * as fs from 'fs';
import { Container, Service } from 'typedi';
import { BoxMultiplierService } from './box-multiplier.service';

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8'));

@Service()
export class DictionaryValidationService {
    dictionary: Set<string> = new Set();
    gameboard: Gameboard = new Gameboard(Container.get(BoxMultiplierService)); // not sure if this is good

    constructor() {
        jsonDictionary.words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    validateWords(enteredWords: Word[]): number {
        this.checkWordInDictionary(enteredWords);
        const invalidWords = this.isolateInvalidWords(enteredWords);
        let roundPoints = 0;
        if (invalidWords.length !== 0) return roundPoints;
        enteredWords.forEach((word: Word) => {
            roundPoints += word.calculatePoints(this.gameboard);
        });
        return roundPoints;
    }

    private checkWordInDictionary(wordList: Word[]): void {
        wordList.forEach((word) => {
            console.log(word.stringFormat);
            console.log(this.dictionary.has(word.stringFormat));
            !this.dictionary.has(word.stringFormat) ? (word.isValid = false) : (word.isValid = true);
        });
    }

    private isolateInvalidWords(enteredWords: Word[]) {
        return enteredWords.filter((word) => word.isValid === false);
    }
}
