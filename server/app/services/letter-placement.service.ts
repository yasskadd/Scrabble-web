import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@common/command-info';
import { Coordinate } from '@common/interfaces/coordinate';
import { Letter } from '@common/interfaces/letter';
import { Service } from 'typedi';
import { DictionaryValidationService } from './dictionary-validation.service';

const BOARD_LENGTH = 15;

export enum ErrorType {
    CommandCoordinateOutOfBounds = 'Placement invalide pour la premiere coordonnée',
    LettersNotInRack = 'Les lettres ne sont pas dans le chavalet',
    InvalidFirstWordPlacement = "Le mot doit être attaché à un autre mot (ou passer par la case du milieu si c'est le premier tour)",
    InvalidWordBuild = "Le mot ne possède qu'une lettre OU les lettres en commande sortent du plateau",
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
        if (!this.validateCommandCoordinate(commandInfo.firstCoordinate, gameboard)) return [{} as Word, ErrorType.CommandCoordinateOutOfBounds];
        if (!this.areLettersInRack(commandInfo.letters, player)) return [{} as Word, ErrorType.LettersNotInRack];

        const commandWord = new Word(commandInfo, gameboard);
        if (!commandWord.isValid) return [{} as Word, ErrorType.InvalidWordBuild];
        if (!this.wordIsPlacedCorrectly(commandWord.wordCoords, gameboard)) return [{} as Word, ErrorType.InvalidFirstWordPlacement];

        return [commandWord, null];
    }

    placeLetters(commandWord: Word, commandInfo: CommandInfo, player: Player, currentGameboard: Gameboard): PlaceLettersReturn {
        this.placeNewLettersOnBoard(commandInfo, commandWord, currentGameboard);

        const validateWordReturn = this.dictionaryService.validateWord(commandWord, currentGameboard);
        if (!validateWordReturn.points) {
            this.removeLettersFromBoard(commandWord, currentGameboard);
            return { hasPassed: false, gameboard: currentGameboard, invalidWords: validateWordReturn.invalidWords };
        }
        this.updatePlayerScore(validateWordReturn.points, commandWord, player);
        this.updatePlayerRack(commandInfo.letters, player);
        return { hasPassed: true, gameboard: currentGameboard, invalidWords: [] as Word[] };
    }

    private validateCommandCoordinate(commandCoord: Coordinate, gameboard: Gameboard): boolean {
        if (!gameboard.getLetterTile(commandCoord).isOccupied) return this.isWithinBoardLimits(commandCoord);
        else return false;
    }

    private isWithinBoardLimits(coord: Coordinate): boolean {
        return coord.x >= 1 && coord.x <= 15 && coord.y >= 1 && coord.y <= 15;
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
        let up: Coordinate;
        let down: Coordinate;
        let left: Coordinate;
        let right: Coordinate;
        let lettersWithAdjacencyCount = 0;

        letterCoords.forEach((coord) => {
            this.setUpLeftDownRight(coord, up, left, down, right);
            if (this.upDownLeftOrRightAreOccupied(gameboard, up, down, left, right)) lettersWithAdjacencyCount++;
        });

        if (lettersWithAdjacencyCount === 0) return false;
        else return true;
    }

    private setUpLeftDownRight(coord: Coordinate, up: Coordinate, left: Coordinate, down: Coordinate, right: Coordinate) {
        up = { x: coord.x, y: coord.y - 1 };
        down = { x: coord.x, y: coord.y + 1 };
        left = { x: coord.x - 1, y: coord.y };
        right = { x: coord.x + 1, y: coord.y };
    }

    private upDownLeftOrRightAreOccupied(gameboard: Gameboard, up: Coordinate, down: Coordinate, left: Coordinate, right: Coordinate): boolean {
        return (
            (gameboard.getLetterTile(up).isOccupied && this.isWithinBoardLimits(up)) ||
            (gameboard.getLetterTile(down).isOccupied && this.isWithinBoardLimits(down)) ||
            (gameboard.getLetterTile(left).isOccupied && this.isWithinBoardLimits(left)) ||
            (gameboard.getLetterTile(right).isOccupied && this.isWithinBoardLimits(right))
        );
    }

    private placeNewLettersOnBoard(commandInfo: CommandInfo, commandWord: Word, gameboard: Gameboard) {
        const commandLettersCopy = commandInfo.letters.slice();
        commandWord.newLetterCoords.forEach((coord) => {
            gameboard.placeLetter(coord, commandLettersCopy[0]);
            if (commandLettersCopy[0] === commandLettersCopy[0].toUpperCase()) gameboard.getLetterTile(coord).points = 0;
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
            const itemInRack = player.rack.filter((item: Letter) => item.value === letter)[0];
            const index = player.rack.indexOf(itemInRack);
            if (index > INDEX_NOT_FOUND) player.rack.splice(index, 1);
        });
    }
}
