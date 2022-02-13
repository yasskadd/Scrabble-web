/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { PlacementCommandInfo } from '@app/command-info';
import { Coordinate } from '@app/coordinate';
import { Letter } from '@common/letter';
import { Service } from 'typedi';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordFinderService } from './word-finder.service';

const ERROR_TYPE = {
    invalidPlacement: 'Invalid placement',
    lettersNotInRack: 'Letters not in rack',
    invalidFirstPlacement: 'First placement is invalid',
};
@Service()
export class LetterPlacementService {
    constructor(
        private validateCoordService: GameboardCoordinateValidationService,
        private wordFinderService: WordFinderService,
        private dictionaryService: DictionaryValidationService,
    ) {}

    globalCommandVerification(commandInfo: PlacementCommandInfo, gameboard: GameBoard, player: Player) {
        const letterCoords = this.getLettersCoord(commandInfo, gameboard);
        console.log(letterCoords);
        if (!this.isPlacementValid(letterCoords)) return [letterCoords, ERROR_TYPE.invalidFirstPlacement];
        // it updates letters points in gameboardCoordinate
        if (!this.areLettersInRack(letterCoords, player)) return [letterCoords, ERROR_TYPE.lettersNotInRack];
        if (!this.verifyFirstTurn(letterCoords, gameboard)) return [letterCoords, ERROR_TYPE.invalidFirstPlacement];
        return [letterCoords, null];
    }

    placeLetter(letterCoords: GameboardCoordinate[], player: Player, gameboard: GameBoard): [boolean, GameBoard] {
        const wordValidationScore: number = this.dictionaryService.validateWords(this.wordFinderService.findNewWords(gameboard, letterCoords));
        if (wordValidationScore === 0) return [false, gameboard];
        player.score += wordValidationScore;
        if (letterCoords.length === 7) player.score += 50;
        return [true, gameboard];
    }

    private getLettersCoord(commandInfo: PlacementCommandInfo, gameboard: GameBoard) {
        return this.validateCoordService.validateGameboardCoordinate(commandInfo, gameboard);
    }

    private isPlacementValid(lettersCoords: GameboardCoordinate[]) {
        return lettersCoords.length > 0;
    }

    private createTempRack(player: Player): Letter[] {
        const tempPlayerRack: Letter[] = [];
        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }
        return tempPlayerRack;
    }

    private associateLettersWithRack(placedLettersCoord: GameboardCoordinate[], player: Player): (Letter | undefined)[] {
        const tempRack = this.createTempRack(player);
        const letters = placedLettersCoord.map((coord) => {
            const index = tempRack.findIndex((letter) => {
                return letter.stringChar === coord.letter.stringChar;
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

    private createLetterPoints(letterCoords: GameboardCoordinate[], lettersFromRack: Letter[]) {
        // create new letterCoords
        const newLetterCoords = letterCoords.map((coord) => {
            const index = lettersFromRack.findIndex((letter) => {
                return letter.stringChar === coord.letter.stringChar;
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

    private areLettersInRack(letterCoords: GameboardCoordinate[], player: Player) {
        const letters = this.associateLettersWithRack(letterCoords, player);
        if (letters.length !== letterCoords.length) return false;
        else {
            letterCoords = this.createLetterPoints(letterCoords, letters as Letter[]) as GameboardCoordinate[];
            return true;
        }
    }

    private verifyFirstTurn(lettersCoords: GameboardCoordinate[], gameboard: GameBoard) {
        if (gameboard.gameboardCoords.every((coord) => coord.isOccupied === false)) {
            const coordList: Coordinate[] = new Array();
            lettersCoords.forEach((coord) => {
                coordList.push({ x: coord.x, y: coord.y } as Coordinate);
            });
            if (!coordList.some((element) => element.x === 7 && element.y === 7)) return false;
        }
        return true;
    }
}
