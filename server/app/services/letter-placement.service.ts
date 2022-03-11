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
    invalidFirstWordPlacement = 'Le mot doit etre attaché à un autre mot (ou passer par la case du milieu)',
    invalidWordBuild = 'Le mot est invalide',
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
            return true;
        } else {
            return this.checkIfWordIsNextToOther(lettersCoords, gameboard);
        }
    }

    private checkIfWordIsNextToOther(letterCoords: Coordinate[], gameboard: Gameboard): boolean {
        let up, down, left, right: Coordinate;
        let lettersWithAdjacency: number = 0;

        letterCoords.forEach((coord) => {
            up = { x: coord.x, y: coord.y-- };
            down = { x: coord.x, y: coord.y++ };
            left = { x: coord.x--, y: coord.y };
            right = { x: coord.x++, y: coord.y };
            if (
                gameboard.getLetterTile(up).isOccupied ||
                gameboard.getLetterTile(down).isOccupied ||
                gameboard.getLetterTile(left).isOccupied ||
                gameboard.getLetterTile(right).isOccupied
            )
                lettersWithAdjacency++;
        });

        if (lettersWithAdjacency++ === 0) return false;
        else return true;
    }

    public placeLetters(commandWord: Word, commandInfo: CommandInfo, player: Player, gameboard: Gameboard): [boolean, Gameboard] {
        const commandLettersCopy = commandInfo.letters.slice();
        commandWord.newLetterCoords.forEach((coord) => {
            gameboard.placeLetter(coord, commandLettersCopy[0]);
            commandLettersCopy.shift();
        });

        const wordScore = this.dictionaryService.validateWord(commandWord, gameboard);

        if (wordScore === 0) {
            commandWord.newLetterCoords.forEach((coord) => gameboard.removeLetter(coord)); // TODO : wait 3 seconds
            return [false, gameboard];
        }
        this.updatePlayerScore(wordScore, commandWord, player);
        this.updatePlayerRack(commandInfo.letters, player);
        return [true, gameboard];
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
