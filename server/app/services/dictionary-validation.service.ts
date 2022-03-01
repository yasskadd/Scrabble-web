/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree } from '@app/classes/trie/letter-tree.class';
import { Word } from '@app/classes/word.class';
import * as fs from 'fs';
import { Service } from 'typedi';

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/dictionary.json', 'utf8'));

@Service()
export class DictionaryValidationService {
    dictionary: Set<string> = new Set();
    trie: LetterTree;
    gameboard: Gameboard = new Gameboard();

    constructor() {
        jsonDictionary.words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    validateWord(word: Word, gameboard: Gameboard): number {
        const foundWords = word.findAdjacentWords(word, gameboard); // TODO: take out repitition of word
        this.checkWordInDictionary(foundWords);
        return this.calculateTurnPoints(word, foundWords, gameboard);
    }

    createTrieDictionary() {
        this.trie = new LetterTree(jsonDictionary.words);
    }

    private checkWordInDictionary(wordList: Word[]): void {
        wordList.forEach((word) => {
            !this.dictionary.has(word.stringFormat) ? (word.isValid = false) : (word.isValid = true);
        });
    }

    private calculateTurnPoints(word: Word, foundWords: Word[], gameboard: Gameboard): number {
        let totalPointsForTurn = 0;
        if (this.isolateInvalidWords(foundWords).length !== 0) totalPointsForTurn = 0;
        else
            foundWords.forEach((enteredWord: Word) => {
                totalPointsForTurn += enteredWord.calculateWordPoints(enteredWord, gameboard);
            });

        return totalPointsForTurn;
    }

    private isolateInvalidWords(foundWords: Word[]) {
        return foundWords.filter((word) => word.isValid === false);
    }
}
