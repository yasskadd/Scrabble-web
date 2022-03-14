import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { Service } from 'typedi';
import { DictionaryValidationService } from './dictionary-validation.service';

export enum ErrorType {
    commandCoordinateOutOfBounds = 'Placement invalide pour la premiere coordonnée',
    lettersNotInRack = 'Les lettres ne sont pas dans le chavalet',
    invalidFirstWordPlacement = 'Le mot doit etre attaché à un autre mot (ou passer par la case du milieu si c<est le premier tour)',
    invalidWordBuild = "Le mot ne possède qu'une lettre OU les lettres en commande sortent du plateau",
}

export interface PlaceLettersReturn {
    hasPassed: boolean;
    gameboard: Gameboard;
    invalidWords: Word[];
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
        if (!this.wordIsPlacedCorrectly(commandWord.wordCoords, gameboard)) return [{} as Word, ErrorType.invalidFirstWordPlacement];

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
        const tempRack: Letter[] = this.createTempRack(player);
        const lettersPresentInRack = this.findLettersPresentInRack(commandLetters, tempRack);
        return lettersPresentInRack.length === commandLetters.length;
    }

    private findLettersPresentInRack(commandLetters: string[], tempRack: Letter[]): string[] {
        const rackLetters = commandLetters.map((commandLetter) => {
            let tempCommandLetter: string = commandLetter;
            if (this.isBlankLetter(tempCommandLetter)) tempCommandLetter = '*';
            return this.findRackLetter(tempRack, tempCommandLetter);
        });

        return rackLetters.filter((letter) => letter !== undefined) as string[];
    }

    private isBlankLetter(tempCommandLetter: string) {
        return tempCommandLetter === tempCommandLetter.toUpperCase();
    }

    private findRackLetter(tempRack: Letter[], tempCommandLetter: string): string | undefined {
        const index = tempRack.findIndex((letterInRack) => {
            return letterInRack.value === tempCommandLetter;
        });

        if (index < 0) return;
        else {
            this.removeLetterFromTempRack(tempRack, index);
            return tempCommandLetter;
        }
    }

    private removeLetterFromTempRack(tempRack: Letter[], index: number) {
        tempRack.splice(index, 1);
    }

    private wordIsPlacedCorrectly(letterCoords: Coordinate[], gameboard: Gameboard): boolean {
        if (this.isFirstTurn(gameboard)) return this.verifyFirstTurn(letterCoords);
        else return this.isWordIsAttachedToBoardLetter(letterCoords, gameboard);
    }

    private isFirstTurn(gameboard: Gameboard): boolean {
        return gameboard.gameboardTiles.every((coord) => coord.isOccupied === false);
    }

    private verifyFirstTurn(letterCoords: Coordinate[]): boolean {
        const coordList: Coordinate[] = new Array();
        letterCoords.forEach((coord) => {
            coordList.push({ x: coord.x, y: coord.y });
        });
        return this.containsMiddleCoord(coordList);
    }

    private containsMiddleCoord(coordList: Coordinate[]): boolean {
        return coordList.some((element) => element.x === MIDDLE_X && element.y === MIDDLE_Y);
    }

    private isWordIsAttachedToBoardLetter(letterCoords: Coordinate[], gameboard: Gameboard): boolean {
        let up, down, left, right: Coordinate;
        let lettersWithAdjacency: number = 0;

        letterCoords.forEach((coord) => {
            up = { x: coord.x, y: coord.y-- };
            down = { x: coord.x, y: coord.y++ };
            left = { x: coord.x--, y: coord.y };
            right = { x: coord.x++, y: coord.y };
            if (this.upDownLeftOrRightAreOccupied(gameboard, up, down, left, right)) lettersWithAdjacency++;
        });

        if (!lettersWithAdjacency) return false;
        else return true;
    }

    private upDownLeftOrRightAreOccupied(gameboard: Gameboard, up: Coordinate, down: Coordinate, left: Coordinate, right: Coordinate): boolean {
        return (
            gameboard.getLetterTile(up).isOccupied ||
            gameboard.getLetterTile(down).isOccupied ||
            gameboard.getLetterTile(left).isOccupied ||
            gameboard.getLetterTile(right).isOccupied
        );
    }

    public placeLetters(commandWord: Word, commandInfo: CommandInfo, player: Player, gameboard: Gameboard): PlaceLettersReturn {
        this.placeNewLettersOnBoard(commandInfo, commandWord, gameboard);

        const validateWordReturn = this.dictionaryService.validateWord(commandWord, gameboard);
        if (validateWordReturn.points === 0) {
            this.removeLettersFromBoard(commandWord, gameboard);
            return { hasPassed: false, gameboard: gameboard, invalidWords: validateWordReturn.invalidWords };
        }
        this.updatePlayerScore(validateWordReturn.points, commandWord, player);
        this.updatePlayerRack(commandInfo.letters, player);
        return { hasPassed: true, gameboard: gameboard, invalidWords: [] as Word[] };
    }

    private placeNewLettersOnBoard(commandInfo: CommandInfo, commandWord: Word, gameboard: Gameboard) {
        const commandLettersCopy = commandInfo.letters.slice();
        commandWord.newLetterCoords.forEach((coord) => {
            gameboard.placeLetter(coord, commandLettersCopy[0]);
            commandLettersCopy.shift();
        });
    }

    private removeLettersFromBoard(commandWord: Word, gameboard: Gameboard) {
        commandWord.newLetterCoords.forEach((coord) => gameboard.removeLetter(coord));
    }

    private updatePlayerScore(wordScore: number, commandWord: Word, player: Player) {
        player.score += wordScore;
        if (commandWord.newLetterCoords.length === SEVEN_LETTERS) player.score += SEVEN_LETTER_BONUS;
    }

    private updatePlayerRack(letters: string[], player: Player): void {
        const INDEX_NOT_FOUND = -1;
        letters.forEach((letter) => {
            if (letter === letter.toUpperCase()) letter = '*';
            const itemInRack = player.rack.filter((item: Letter) => item.value == letter)[0];
            const index = player.rack.indexOf(itemInRack);
            if (index > INDEX_NOT_FOUND) player.rack.splice(index, 1);
        });
    }
}
