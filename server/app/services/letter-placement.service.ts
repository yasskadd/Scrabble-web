/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { Word } from '@app/classes/word.class';
import { PlacementCommandInfo } from '@app/command-info';
import { Coordinate } from '@app/coordinate';
import { Letter } from '@common/letter';
import { Service } from 'typedi';
import { GameboardCoordinateValidationService } from './coordinate-validation.service';
import { DictionaryValidationService } from './dictionary-validation.service';
import { WordFinderService } from './word-finder.service';

@Service()
export class LetterPlacementService {
    constructor(
        private validateCoordService: GameboardCoordinateValidationService,
        private wordFinderService: WordFinderService,
        private dictionaryService: DictionaryValidationService,
    ) {}

    placeLetter(player: Player, commandInfo: PlacementCommandInfo, gameboard: GameBoard): [boolean, GameBoard] {
        let coords = this.validateCoordService.validateGameboardCoordinate(commandInfo, gameboard);
        console.log(coords);
        // if there is no placed letters, return false
        if (coords.length === 0) return [false, gameboard];

        // if gameboard is empty coords must include (7, 7)
        if (gameboard.gameboardCoords.every((coord) => coord.isOccupied === false)) {
            const coordList: Coordinate[] = new Array();
            coords.forEach((coord) => {
                coordList.push({ x: coord.x, y: coord.y } as Coordinate);
            });
            if (!coordList.some((element) => element.x === 7 && element.y === 7)) return [false, gameboard];
        }

        const tempPlayerRack = this.createTempRack(player);
        const letters = this.associateLettersWithRack(coords, tempPlayerRack);
        // Verify if the placed Letters are in the player's rack
        if (coords.length !== letters.length) return [false, gameboard];

        // update points
        coords = this.createLetterPoints(coords, letters as Letter[]);

        // Update the player's rack
        player.rack = tempPlayerRack;

        // Placer letters on gameboard
        for (const coord of coords) {
            gameboard.placeLetter(coord);
        }

        const wordList: Word[] = this.wordFinderService.findNewWords(gameboard, coords);
        const validateWord: number = this.dictionaryService.validateWords(wordList);
        // update player score
        // If there is no validateWord
        // If theres no valid word that means we should reverse the update player's rack made in line 47?????
        if (validateWord === 0) return [false, gameboard];
        player.score += validateWord;

        return [true, gameboard];
    }

    private createTempRack(player: Player): Letter[] {
        const tempPlayerRack: Letter[] = [];
        for (const letter of player.rack) {
            tempPlayerRack.push(letter);
        }
        return tempPlayerRack;
    }

    private associateLettersWithRack(placedLettersCoord: GameboardCoordinate[], rack: Letter[]): (Letter | undefined)[] {
        const tempRack = rack;
        const letters = placedLettersCoord.map((coord) => {
            const index = tempRack.findIndex((letter) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                // console.log(coord.letter.stringChar);
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
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                // console.log(coord.letter.stringChar);
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
}
