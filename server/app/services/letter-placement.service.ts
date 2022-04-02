import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import { PlaceLettersReturn } from '@app/interfaces/place-letters-return';
import { CommandInfo } from '@common/interfaces/command-info';
import { Coordinate } from '@common/interfaces/coordinate';
import { Letter } from '@common/interfaces/letter';
import { Service } from 'typedi';
import { DictionaryValidationService } from './dictionary-validation.service';

export enum ErrorType {
    CommandCoordinateOutOfBounds = 'Placement invalide pour la premiere coordonnée',
    LettersNotInRack = 'Les lettres ne sont pas dans le chavalet',
    InvalidFirstWordPlacement = "Le mot doit être attaché à un autre mot (ou passer par la case du milieu si c'est le premier tour)",
    InvalidWordBuild = "Le mot ne possède qu'une lettre OU les lettres en commande sortent du plateau",
}

const MIDDLE_X = 8;
const MIDDLE_Y = 8;

@Service()
export class LetterPlacementService {
    private dictionaryValidationService: DictionaryValidationService;
    constructor(dictionary: string[]) {
        this.dictionaryValidationService = new DictionaryValidationService(dictionary);
    }

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

        const validateWordReturn = this.dictionaryValidationService.validateWord(commandWord, currentGameboard);
        if (!validateWordReturn.points) {
            this.removeLettersFromBoard(commandWord, currentGameboard);
            return { hasPassed: false, gameboard: currentGameboard, invalidWords: validateWordReturn.invalidWords };
        }

        this.updatePlayerScore(validateWordReturn.points, commandWord, player);
        this.updatePlayerRack(commandInfo.letters, player.rack);

        return { hasPassed: true, gameboard: currentGameboard, invalidWords: [] as Word[] };
    }

    areLettersInRack(commandLetters: string[], player: Player): boolean {
        const tempRack: Letter[] = this.createTempRack(player);
        const lettersPresentInRack = this.findLettersPresentInRack(commandLetters, tempRack);
        return lettersPresentInRack.length === commandLetters.length;
    }

    private validateCommandCoordinate(commandCoord: Coordinate, gameboard: Gameboard): boolean {
        if (!gameboard.getLetterTile(commandCoord).isOccupied) return gameboard.isWithinBoardLimits(commandCoord);
        return false;
    }

    private createTempRack(player: Player): Letter[] {
        const tempPlayerRack: Letter[] = [];
        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }
        return tempPlayerRack;
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
        let lettersWithAdjacencyCount = 0;
        letterCoords.forEach((coord) => {
            if (this.upDownLeftOrRightAreOccupied(coord, gameboard)) lettersWithAdjacencyCount++;
        });

        if (lettersWithAdjacencyCount === 0) return false;
        else return true;
    }

    private upDownLeftOrRightAreOccupied(coord: Coordinate, gameboard: Gameboard): boolean {
        return (
            (gameboard.getLetterTile({ x: coord.x, y: coord.y - 1 }).isOccupied && gameboard.isWithinBoardLimits({ x: coord.x, y: coord.y - 1 })) ||
            (gameboard.getLetterTile({ x: coord.x, y: coord.y + 1 }).isOccupied && gameboard.isWithinBoardLimits({ x: coord.x, y: coord.y + 1 })) ||
            (gameboard.getLetterTile({ x: coord.x - 1, y: coord.y }).isOccupied && gameboard.isWithinBoardLimits({ x: coord.x - 1, y: coord.y })) ||
            (gameboard.getLetterTile({ x: coord.x + 1, y: coord.y }).isOccupied && gameboard.isWithinBoardLimits({ x: coord.x + 1, y: coord.y }))
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
    }

    private updatePlayerRack(letters: string[], playerRack: Letter[]): void {
        const INDEX_NOT_FOUND = -1;
        letters.forEach((letter) => {
            if (letter === letter.toUpperCase()) letter = '*';
            const itemInRack = playerRack.filter((item: Letter) => item.value === letter)[0];
            const index = playerRack.indexOf(itemInRack);
            if (index > INDEX_NOT_FOUND) playerRack.splice(index, 1);
        });
    }
}
