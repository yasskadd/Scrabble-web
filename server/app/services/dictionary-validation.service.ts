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

const jsonDictionary = JSON.parse(fs.readFileSync('./assets/letter-reserve.json', 'utf8'));

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
        let enteredWords = this.wordFinderService.findAjacentWords(word, gameboard);
        this.checkWordInDictionary(enteredWords);
        const invalidWords = this.isolateInvalidWords(enteredWords);
        let turnPoints = 0;

        if (invalidWords.length !== 0) {
            word.newLetterCoords.forEach((coord) => gameboard.removeLetter(coord));
            return turnPoints;
        }

        enteredWords.forEach((word: Word) => {
            turnPoints += this.scoreService.calculateWordPoints(word, gameboard);
        });

        return turnPoints;
    }

    private checkWordInDictionary(enteredWords: Word[]): void {
        enteredWords.forEach((word) => {
            !this.dictionary.has(word.stringFormat) ? (word.isValid = false) : (word.isValid = true);
        });
    }

    private isolateInvalidWords(enteredWords: Word[]) {
        return enteredWords.filter((word) => word.isValid === false);
    }
}
