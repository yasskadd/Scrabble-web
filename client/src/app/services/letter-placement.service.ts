import { Injectable } from '@angular/core';
import * as constants from '@app/constants';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';

@Injectable({
    providedIn: 'root',
})
export class LetterPlacementService {
    private startTile: Coordinate;
    private placedLetters: Letter[];
    private isHorizontal: boolean;
    private isPlacingActive: boolean;

    constructor(private gridService: GridService, private gameClientService: GameClientService) {
        this.startTile = { x: 0, y: 0 };
        this.placedLetters = [];
        this.isHorizontal = true;
        this.isPlacingActive = false;

        this.gameClientService.gameboardUpdated.subscribe(() => {
            this.resetGameBoardView();
        });
    }

    handlePlacement(letterValue: string) {
        const INDEX_NOT_FOUND = -1;
        const indexOfLetter = this.gameClientService.playerOne.rack.findIndex((letter) => letter.value === letterValue);
        if (indexOfLetter === INDEX_NOT_FOUND) return;
        const placedLetter = this.gameClientService.playerOne.rack.splice(indexOfLetter, 1)[0];
        this.placeLetter(placedLetter);
    }

    placeLetter(letter: Letter) {
        if (!(this.gameClientService.playerOneTurn || this.isPlacingActive)) return;
        this.placedLetters.push(letter);
        this.updateLettersView();
    }

    updateLettersView() {
        this.placedLetters.forEach((letter, index) => {
            this.gridService.drawUnfinalizedLetter(this.calculateNextCoordinate(index), letter);
        });
        const arrowPosition = this.calculateNextCoordinate(this.placedLetters.length);
        this.gridService.drawArrow(arrowPosition, this.isHorizontal);
    }

    calculateNextCoordinate(positionFromStart: number): Coordinate {
        return this.isHorizontal
            ? { ...this.startTile, x: this.startTile.x + positionFromStart }
            : { ...this.startTile, y: this.startTile.y + positionFromStart };
    }

    undoPlacement() {
        if (this.placedLetters.length === 0) return;
        this.resetGameBoardView();
        this.gameClientService.playerOne.rack.push(this.placedLetters.pop() as Letter);
        this.updateLettersView();
    }

    resetGameBoardView() {
        this.gridService.drawGrid(this.gameClientService.gameboard);
    }

    // Might not be the best place to put it
    setCanvas(canvas: CanvasRenderingContext2D) {
        this.gridService.gridContext = canvas;
    }

    placeLetterStartPosition(coordinate: Coordinate) {
        const position = this.gridService.getPosition(coordinate);
        if (
            !this.gameClientService.playerOneTurn ||
            this.isOutOfBound(coordinate) ||
            this.gameClientService.gameboard[this.getArrayIndex(position)].isOccupied
        )
            return;
        if (this.startTile.x === position.x && this.startTile.y === position.y) {
            this.isHorizontal = !this.isHorizontal;
            this.gridService.drawArrow(position, this.isHorizontal);
            return;
        }
        this.startTile = position;
        this.gridService.drawArrow(position, true);
        this.isPlacingActive = true;
    }
    private isOutOfBound(coordinate: Coordinate): boolean {
        return coordinate.x === 0 || coordinate.y === 0;
    }
    private getArrayIndex(coordinate: Coordinate): number {
        const TILES_IN_ROW = constants.TOTAL_COLUMNS - 1;
        const DISPLACEMENT = 1;
        return coordinate.x - DISPLACEMENT + (coordinate.y - DISPLACEMENT) * TILES_IN_ROW;
    }
}
