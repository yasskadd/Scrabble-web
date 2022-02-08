/* eslint-disable prettier/prettier */

import { Coordinate } from '@app/classes/coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { Word } from '@app/classes/word.class';
import { Letter } from '@app/letter';
import Container, { Service } from 'typedi';
import { CoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordFinderService } from './word-finder.service';

@Service()
export class LetterPlacementService {
    validateCoordService = Container.get(CoordinateValidationService);
    wordFinderService = Container.get(WordFinderService);
    dictionaryService = Container.get(DictionaryValidationService);

    placeLetter(player: Player, firstCoordinate: Coordinate, direction: string, lettersPlaced: string[], gameboard: GameBoard) {
        const coords = this.validateCoordService.validateCoordinate(lettersPlaced, firstCoordinate, direction, gameboard);
        if (coords.length === 0) return [];
        const tempPlayerRack: Letter[] = [];

        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }

        const letters = coords.map((letter) => {
            const index = tempPlayerRack.findIndex((element) => {
                element.stringChar === letter;
            });
            if (index < 0) {
                return;
            } else {
                const tempLetter = tempPlayerRack[index];
                delete tempPlayerRack[index];
                return tempLetter;
            }
        });

        if (coords.length !== letters.length) {
            return [];
        }

        player.rack = tempPlayerRack;

        // TODO: return empty array if validateCoordService returns empty array or letters are not in player's rack

        for (const letter of letters) {
            gameboard.placeLetter(letter);
        }

        const wordList: Word[] = this.wordFinderService.findNewWords(gameboard, coords);
        const validateWord: number = this.dictionaryService.validateWords(wordList);
        if (validateWord === 0) return gameboard; // avec false??

        return gameboard; // avec true?mm
    }
}
