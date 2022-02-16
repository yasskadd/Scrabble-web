/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Service } from 'typedi';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordFinderService } from './word-finder.service';

const ERROR_TYPE = {
    invalidPlacement: 'Placement invalide',
    lettersNotInRack: 'Lettres absents du chevalet',
    invalidFirstPlacement: 'Placement du premier tour pas valide',
};

const SEVEN_LETTERS = 7;
const SEVEN_LETTER_BONUS = 50;
const MIDDLE_X = 8;
const MIDDLE_Y = 8;

@Service()
export class LetterPlacementService {
    constructor(
        private validateCoordService: GameboardCoordinateValidationService,
        private wordFinderService: WordFinderService,
        private dictionaryService: DictionaryValidationService,
    ) {}

    globalCommandVerification(commandInfo: CommandInfo, gameboard: Gameboard, player: Player) {
        const letterCoords = this.getLettersCoord(commandInfo, gameboard);
        if (!this.isPlacementValid(letterCoords)) {
            return [letterCoords, ERROR_TYPE.invalidPlacement];
        }
        if (!this.areLettersInRack(letterCoords, player)) {
            return [letterCoords, ERROR_TYPE.lettersNotInRack];
        }
        if (!this.verifyFirstTurn(letterCoords, gameboard)) {
            return [letterCoords, ERROR_TYPE.invalidFirstPlacement];
        }
        return [letterCoords, null];
    }

    placeLetter(letterCoords: LetterTile[], player: Player, gameboard: Gameboard): [boolean, Gameboard] {
        letterCoords.forEach((coord) => {
            gameboard.placeLetter(coord);
        });
        const words: Word[] = this.wordFinderService.findNewWords(gameboard, letterCoords);
        const wordValidationScore: number = this.dictionaryService.validateWords(words);
        if (wordValidationScore === 0) {
            letterCoords.forEach((coord) => {
                gameboard.removeLetter(coord);
                return [false, gameboard];
            });
        }
        player.score += wordValidationScore;
        if (letterCoords.length === SEVEN_LETTERS) player.score += SEVEN_LETTER_BONUS;
        this.updatePlayerRack(letterCoords, player);
        return [true, gameboard];
    }

    private getLettersCoord(commandInfo: CommandInfo, gameboard: Gameboard) {
        return this.validateCoordService.validateGameboardCoordinate(commandInfo, gameboard);
    }

    private isPlacementValid(lettersCoords: LetterTile[]) {
        return lettersCoords.length > 0;
    }

    private createTempRack(player: Player): Letter[] {
        const tempPlayerRack: Letter[] = [];
        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }
        return tempPlayerRack;
    }

    private associateLettersWithRack(placedLettersCoord: LetterTile[], player: Player): (Letter | undefined)[] {
        const tempRack = this.createTempRack(player);
        const letters = placedLettersCoord.map((coord) => {
            // BLANK LETTER IMPLEMENTATION
            if (coord.letter.value === coord.letter.value.toUpperCase()) {
                coord.letter.isBlankLetter = true;
                coord.letter.points = 0;
            }
            const index = tempRack.findIndex((letter) => {
                if (coord.letter.isBlankLetter !== undefined && coord.letter.isBlankLetter) {
                    return letter.value === '*';
                }
                return letter.value === coord.letter.value;
            });
            if (index < 0) return;
            else {
                const tempLetter = tempRack[index];
                tempRack.splice(index, 1);
                return tempLetter;
            }
        });
        return letters.filter((letter) => {
            return letter !== undefined;
        });
    }

    private createLetterPoints(letterCoords: LetterTile[], lettersFromRack: Letter[]) {
        // create new letterCoords
        const newLetterCoords = letterCoords.map((coord) => {
            const index = lettersFromRack.findIndex((letter) => {
                return letter.value === coord.letter.value;
            });
            if (index < 0) return;
            else {
                coord.letter.points = lettersFromRack[index].points;
                return coord;
            }
        });
        return newLetterCoords.filter((coord) => {
            return coord !== undefined;
        });
    }

    private areLettersInRack(letterCoords: LetterTile[], player: Player) {
        const letters = this.associateLettersWithRack(letterCoords, player);
        if (letters.length !== letterCoords.length) return false;
        else {
            letterCoords = this.createLetterPoints(letterCoords, letters as Letter[]) as LetterTile[];
            return true;
        }
    }

    private verifyFirstTurn(lettersCoords: LetterTile[], gameboard: Gameboard) {
        if (gameboard.gameboardCoords.every((coord) => coord.isOccupied === false)) {
            const coordList: Coordinate[] = new Array();
            lettersCoords.forEach((coord) => {
                coordList.push({ x: coord.x, y: coord.y } as Coordinate);
            });
            if (!coordList.some((element) => element.x === MIDDLE_X && element.y === MIDDLE_Y)) return false;
        } else return false;
        return true;
    }

    private updatePlayerRack(letterCoords: LetterTile[], player: Player) {
        letterCoords.forEach((letterCoord) => {
            const value = player.rack.filter((item) => item.value === letterCoord.letter.value)[0];
            if (player.rack.includes(value)) {
                const index = player.rack.indexOf(value);
                player.rack.splice(index, 1);
            }
        });
    }
}
