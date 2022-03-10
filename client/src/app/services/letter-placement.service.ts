import { Injectable } from '@angular/core';
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
        const letterPosition = this.calculateNextCoordinate();
        this.gridService.drawUnfinalisedLetter(this.calculateNextCoordinate(), letter);
        const arrowPosition = letterPosition;
        if (this.isHorizontal) arrowPosition.x++;
        else arrowPosition.y++;
        this.gridService.drawArrow(arrowPosition, this.isHorizontal);
        this.placedLetters.push(letter);
    }

    calculateNextCoordinate() {
        const position = { ...this.startTile };
        if (this.isHorizontal) {
            position.x += this.placedLetters.length;
            return position;
        }
        position.y += this.placedLetters.length;
        return position;
    }

    resetGameBoardView() {
        this.gridService.drawGrid(this.gameClientService.gameboard);
    }

    setCanvas(canvas: CanvasRenderingContext2D) {
        this.gridService.gridContext = canvas;
    }

    placeLetterStartPosition(coordinate: Coordinate) {
        const position = this.gridService.getPosition(coordinate);
        if (!this.gameClientService.playerOneTurn || coordinate.x === 0 || coordinate.y === 0) return;
        this.startTile = position;
        this.gridService.drawArrow(position, true);
        this.isPlacingActive = true;
    }
}
