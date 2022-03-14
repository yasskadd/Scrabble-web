/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Gameboard } from '@app/classes/gameboard.class';
import { LetterTree } from '@app/classes/trie/letter-tree.class';
import { Word } from '@app/classes/word.class';
import * as fs from 'fs';
import { Service } from 'typedi';

const jsonDictionary = JSON.parse(fs.readFileSync('@app/../assets/dictionary.json', 'utf8'));

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

    validateWord(word: Word, gameboard: Gameboard): [number, Word[]] {
        const foundWords = Word.findAdjacentWords(word, gameboard);
        this.checkWordInDictionary(foundWords);
        return this.calculateTurnPoints(foundWords, gameboard);
    }

    createTrieDictionary() {
        this.trie = new LetterTree(jsonDictionary.words);
    }

    private checkWordInDictionary(wordList: Word[]): void {
        wordList.forEach((word) => {
            if (!this.dictionary.has(word.stringFormat)) word.isValid = false;
        });
    }

    private calculateTurnPoints(foundWords: Word[], gameboard: Gameboard): [number, Word[]] {
        const invalidWords: [boolean, Word[]] = this.isolateInvalidWords(foundWords);
        if (this.isolateInvalidWords(foundWords)[0]) return [0, invalidWords[1]];
        else {
            let pointsForTurn: number = 0;
            foundWords.forEach((foundWord: Word) => {
                pointsForTurn += foundWord.calculateWordPoints(gameboard);
            });
            return [pointsForTurn, invalidWords[1]];
        }
    }

    private isolateInvalidWords(foundWords: Word[]): [boolean, Word[]] {
        return [foundWords.filter((word) => word.isValid === false).length !== 0, foundWords.filter((word) => word.isValid === false)];
    }
}
