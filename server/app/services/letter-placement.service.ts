import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { Service } from 'typedi';
import { DictionaryValidationService } from './dictionary-validation.service';

export enum ErrorType {
    commandCoordinateOutOfBounds = 'First Coordinate is an invalid placement',
    lettersNotInRack = 'Letters not in rack',
    invalidFirstWordPlacement = 'One coordinate in the first word needs to pass by the middle coordinate',
    invalidWordBuild = 'At least one letter in word does not fit on board or word only contains 1 letter',
}

const SEVEN_LETTERS = 7;
const SEVEN_LETTER_BONUS = 50;
const MIDDLE_X = 8;
const MIDDLE_Y = 8;

@Service()
export class LetterPlacementService {
    constructor(private dictionaryService: DictionaryValidationService) {}

    globalCommandVerification(commandInfo: CommandInfo, gameboard: Gameboard, player: Player): [Word, ErrorType | null] {
        if (!this.validateCommandCoordinate(commandInfo.firstCoordinate, gameboard)) return [{} as Word, ErrorType.commandCoordinateOutOfBounds];
        if (!this.areLettersInRack(commandInfo.letters, player)) return [{} as Word, ErrorType.lettersNotInRack];

        const commandWord = new Word(commandInfo, gameboard);
        if (!commandWord.isValid) return [{} as Word, ErrorType.invalidWordBuild];
        if (!this.verifyFirstTurn(commandWord.wordCoords, gameboard)) return [{} as Word, ErrorType.invalidFirstWordPlacement];

        return [commandWord, null];
    }

    private validateCommandCoordinate(commandCoord: Coordinate, gameboard: Gameboard): boolean {
        if (!gameboard.getLetterTile(commandCoord).isOccupied)
            return commandCoord.x >= 1 && commandCoord.x <= 15 && commandCoord.y >= 1 && commandCoord.y <= 15;
        else return false;
    }

    private createTempRack(player: Player): Letter[] {
        const tempPlayerRack: Letter[] = [];
        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }
        return tempPlayerRack;
    }

    private areLettersInRack(commandLetters: string[], player: Player): boolean {
        const tempRack = this.createTempRack(player);

        const letters = commandLetters.map((letterInCommand) => {
            let tempLetter: string = letterInCommand;
            if (tempLetter === tempLetter.toUpperCase()) tempLetter = '*';

            const index = tempRack.findIndex((letterInRack) => {
                return letterInRack.value === tempLetter;
            });

            if (index < 0) return;
            else {
                tempRack.splice(index, 1);
                return tempLetter;
            }
        });

        const lettersPresentInRack = letters.filter((letter) => letter !== undefined) as string[];
        return lettersPresentInRack.length === commandLetters.length;
    }

    private verifyFirstTurn(lettersCoords: Coordinate[], gameboard: Gameboard): boolean {
        if (gameboard.gameboardTiles.every((coord) => coord.isOccupied === false)) {
            const coordList: Coordinate[] = new Array();
            lettersCoords.forEach((coord) => {
                coordList.push({ x: coord.x, y: coord.y } as Coordinate);
            });
            if (!coordList.some((element) => element.x === MIDDLE_X && element.y === MIDDLE_Y)) return false;
        }
        return true;
    }

    public placeLetters(commandWord: Word, commandInfo: CommandInfo, player: Player, gameboard: Gameboard): [boolean, Gameboard] {
        commandWord.newLetterCoords.forEach((coord) => {
            gameboard.placeLetter(coord, commandInfo.letters[0]); // TODO: letters don<t place on board
            commandInfo.letters.shift();
        });
        const wordScore = this.dictionaryService.validateWord(commandWord, gameboard);
        if (wordScore === 0) {
            commandWord.newLetterCoords.forEach((coord) => gameboard.removeLetter(coord)); // TODO : wait 3 seconds
            return [false, gameboard];
        }
        this.updatePlayerScore(wordScore, commandWord, player);
        // TODO: ARRRGH, player rack isn<t updated
        this.updatePlayerRack(commandInfo.letters, player);
        return [true, gameboard];
    }

    private updatePlayerScore(wordScore: number, commandWord: Word, player: Player) {
        player.score += wordScore;
        if (commandWord.newLetterCoords.length === SEVEN_LETTERS) player.score += SEVEN_LETTER_BONUS;
    }

    //TODO : letters aren'T properly removed for some reason
    private updatePlayerRack(letters: string[], player: Player): void {
        const INDEX_NOT_FOUND = -1;
        letters.forEach((letter) => {
            const itemInRack = player.rack.filter((item: Letter) => item.value == letter)[0];
            const index = player.rack.indexOf(itemInRack);
            if (index > INDEX_NOT_FOUND) player.rack.splice(index, 1);
        });
    }
}
