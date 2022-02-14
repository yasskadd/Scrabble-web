/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { Service } from 'typedi';
import { DictionaryValidationService } from './dictionary-validation.service';

enum ErrorType {
    commandCoordinateOutOfBounds = 'First Coordinate is an invalid placement',
    lettersNotInRack = 'Letters not in rack',
    invalidFirstWordPlacement = 'One coordinate in the first word needs to pass by the middle coordinate',
    invalidWordBuild = 'At least one letter in word does not fit on rack or word only contains 1 letter',
    wordsNotInDictionary = 'At Least one newly formed words does not exist in dictionary',
    noErrors = 'All verifications have passed. Letters have been placed on board',
}
@Service()
export class LetterPlacementService {
    constructor(private dictionaryService: DictionaryValidationService) {}

    globalCommandHandler(commandInfo: CommandInfo, gameboard: Gameboard, player: Player): ErrorType {
        if (!this.validateCommandCoordinate(commandInfo.firstCoordinate)) return ErrorType.commandCoordinateOutOfBounds;

        const lettersInRack = this.getLettersInRack(commandInfo.letters, player);
        if (lettersInRack.length !== commandInfo.letters.length) return ErrorType.lettersNotInRack;

        commandInfo.letters.forEach((letterInCommand: string) => player.removeLetterFromRack(letterInCommand));

        // validate word
        this.validateWordConstraints(commandInfo, lettersInRack, gameboard, player);
        return ErrorType.noErrors;
    }

    private validateCommandCoordinate(commandCoord: Coordinate): boolean {
        return commandCoord.x >= 1 && commandCoord.x <= 15 && commandCoord.y >= 1 && commandCoord.y <= 15;
    }
    private getLettersInRack(commandLetters: string[], player: Player): string[] {
        let lettersInRack: string[] = [];
        let tempRack: string[] = this.createTempRack(player);
        commandLetters.forEach((commandLetter: string) => {
            for (let i = 0; i < tempRack.length; i++) {
                tempRack.forEach((rackLetter: string) => {
                    if (rackLetter == commandLetter) {
                        lettersInRack.push(commandLetter);
                        tempRack.splice(i, 1);
                    }
                });
            }
        });
        return lettersInRack;
    }
    private createTempRack(player: Player): string[] {
        const tempPlayerRack: string[] = [];
        player.rack.forEach((letter: string) => tempPlayerRack.push(letter));
        return tempPlayerRack;
    }

    validateWordConstraints(commandInfo: CommandInfo, lettersInRack: string[], gameboard: Gameboard, player: Player) {
        const word = new Word(commandInfo, gameboard);
        if (gameboard.gameboardTiles.every((coord) => coord.isOccupied === false) && !this.validateFirstTurnCoords(word, gameboard))
            return ErrorType.invalidFirstWordPlacement;
        if (!word.isValid) return ErrorType.invalidWordBuild;

        const wordValidationScore: number = this.dictionaryService.validateWord(word, gameboard);
        if (wordValidationScore !== 0) {
            this.updatePlayerScore(word, player, wordValidationScore);
            return ErrorType.noErrors;
        } else {
            setTimeout(() => {
                // TODO : CHECK IF WAITS 3 SECONDS TO REMOVE LETTERS
                word.newLetterCoords.forEach((coord) => gameboard.removeLetter(coord));
                player.replaceLettersOnRack(lettersInRack);
            }, 3000);
            return ErrorType.wordsNotInDictionary;
        }
    }
    private validateFirstTurnCoords(word: Word, gameboard: Gameboard): boolean {
        return word.newLetterCoords.some((coord) => coord.x === 8 && coord.y === 8);
    }
    updatePlayerScore(word: Word, player: Player, score: number) {
        if (word.newLetterCoords.length === 7) player.score += 50;
        player.score += score;
    }
}
