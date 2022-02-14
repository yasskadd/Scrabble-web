/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import { Word } from '@app/classes/word.class';
import { Gameboard } from 'app/classes/gameboard.class';
import * as fs from 'fs';
import { Service } from 'typedi';
import { ScoreService } from './score.service';
import { WordFinderService } from './word-finder.service';

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/dictionary.json', 'utf8'));

@Service()
export class DictionaryValidationService {
    dictionary: Set<string> = new Set();
    scoreService: ScoreService;
    wordFinderService: WordFinderService;

    constructor() {
        jsonDictionary.words.forEach((word: string) => {
            this.dictionary.add(word);
        });
    }

    validateWord(word: Word, gameboard: Gameboard): number {
        const foundWords = this.wordFinderService.findAdjacentWords(word, gameboard);
        this.checkWordInDictionary(foundWords);
        return this.calculateTurnPoints(word, foundWords, gameboard);
    }

    private checkWordInDictionary(foundWords: Word[]): void {
        foundWords.forEach((word) => {
            console.log(word.stringFormat);
            console.log(this.dictionary.has(word.stringFormat));
            if (!this.dictionary.has(word.stringFormat)) word.isValid = false;
        });
    }

    private calculateTurnPoints(word: Word, foundWords: Word[], gameboard: Gameboard): number {
        let totalPointsForTurn = 0;
        if (this.isolateInvalidWords(foundWords).length !== 0) totalPointsForTurn = 0;
        else
            foundWords.forEach((enteredWord: Word) => {
                totalPointsForTurn += this.scoreService.calculateWordPoints(enteredWord, gameboard);
            });

        return totalPointsForTurn;
    }

    private isolateInvalidWords(foundWords: Word[]) {
        return foundWords.filter((word) => word.isValid === false);
    }
}
