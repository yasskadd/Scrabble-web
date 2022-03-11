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
    private hasPlacingEnded: boolean;

    constructor(private gridService: GridService, private gameClientService: GameClientService) {
        this.startTile = { x: 0, y: 0 };
        this.placedLetters = [];
        this.isHorizontal = true;
        this.isPlacingActive = false;
        this.hasPlacingEnded = false;

        this.gameClientService.gameboardUpdated.subscribe(() => {
            this.resetView();
        });
    }

    handlePlacement(letterValue: string) {
        if (!this.isPlacingActive || this.hasPlacingEnded) return;
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
        let placementPosition = this.startTile;
        this.placedLetters.forEach((letter) => {
            placementPosition = this.computeNextCoordinate(placementPosition);
            this.gridService.drawUnfinalizedLetter(placementPosition, letter);
            // TODO: refactor
            if (this.isHorizontal) placementPosition.x++;
            else placementPosition.y++;
        });
        placementPosition = this.computeNextCoordinate(placementPosition);
        if (this.isOutOfBound(placementPosition)) {
            this.hasPlacingEnded = true;
            return;
        }
        this.gridService.drawArrow(placementPosition, this.isHorizontal);
    }

    undoPlacement() {
        if (this.placedLetters.length === 0) return;
        this.resetGameBoardView();
        this.gameClientService.playerOne.rack.push(this.placedLetters.pop() as Letter);
        this.hasPlacingEnded = false;
        this.updateLettersView();
    }

    resetView() {
        this.resetGameBoardView();
        this.placedLetters = [];
        this.isHorizontal = true;
        this.isPlacingActive = false;
        this.hasPlacingEnded = false;
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
            this.isOutOfBound(position) ||
            this.gameClientService.gameboard[this.getArrayIndex(position)].isOccupied ||
            this.placedLetters.length !== 0
        )
            return;
        if (this.startTile.x === position.x && this.startTile.y === position.y) {
            this.isHorizontal = !this.isHorizontal;
            this.gridService.drawArrow(position, this.isHorizontal);
            return;
        }
        this.resetGameBoardView();
        this.startTile = position;
        this.gridService.drawArrow(position, this.isHorizontal);
        this.isPlacingActive = true;
    }

    // TODO: refactor if positionFromStart isn't useful
    private computeNextCoordinate(startingPoint: Coordinate, positionFromStart: number = 0): Coordinate {
        const computedPosition = this.isHorizontal
            ? { ...startingPoint, x: startingPoint.x + positionFromStart }
            : { ...startingPoint, y: startingPoint.y + positionFromStart };
        while (!this.isOutOfBound(computedPosition) && this.gameClientService.gameboard[this.getArrayIndex(computedPosition)].isOccupied) {
            if (this.isHorizontal) computedPosition.x++;
            else computedPosition.y++;
        }
        return computedPosition;
    }

    private isOutOfBound(coordinate: Coordinate): boolean {
        return (
            coordinate.x === 0 || coordinate.y === 0 || coordinate.x > constants.TOTAL_TILES_IN_ROW || coordinate.y > constants.TOTAL_TILES_IN_COLUMN
        );
    }

    private getArrayIndex(coordinate: Coordinate): number {
        const DISPLACEMENT = 1;
        return coordinate.x - DISPLACEMENT + (coordinate.y - DISPLACEMENT) * constants.TOTAL_TILES_IN_ROW;
    }
}
