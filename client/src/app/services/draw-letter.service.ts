import { Injectable } from '@angular/core';
import * as letterConstants from '@common/coordinate';
import { Coordinate } from '@common/coordinate';
const RACK_LETTERS = 7;
const TILE_SIZE = 35;
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 75;

@Injectable({
    providedIn: 'root',
})
export class LetterTilesService {
    gridContext: CanvasRenderingContext2D;

    letterSize: number;
    letterPointsSize: number;
    gridContext: CanvasRenderingContext2D;

    constructor() {
        this.letterSize = letterConstants.FONT_SIZE;
        this.letterPointsSize = letterConstants.POINTS_FONT_SIZE;
    }

    drawLettersOnRack() {
        for (let i = 0; i < RACK_LETTERS; i++) {
            this.drawLetterTile(DEFAULT_WIDTH * 0.25 + TILE_SIZE * i, 1, 'A');
            this.drawLetterWeight(TILE_SIZE * i + DEFAULT_WIDTH * 0.25, 0, '1');
        }
    }

    drawLetterTileOnBoard(position: Coordinate, char: string) {
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeStyle = 'Black';
        const posX = (GridService.squareWidth - GridService.letterTileWidth) / 2;
        const posY = (GridService.squareHeight - GridService.letterTileHeight) / 2;
        this.gridContext.strokeRect(position.x + posX, position.y + posY, GridService.letterTileWidth, GridService.letterTileHeight);
        this.gridContext.fillStyle = 'black';
        this.drawLetter(position, char);
    }

    drawLetterPointsOnBoard(position: Coordinate, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const halfSize = this.letterSize / 2;
        this.gridContext.font = this.letterPointsSize + 'px system-ui';
        this.gridContext.fillText(
            string,
            position.x + GridService.halfSquareWidth + width,
            position.y + halfSize + GridService.halfSquareHeight,
            this.letterSize,
        );
    }

    private drawLetter(position: Coordinate, char: string) {
        this.setFontSize(this.letterSize);
        this.gridContext.textBaseline = 'middle';
        this.drawText(position, char);
    }

    // this function would be similar to drawBasicTile from GridService.
    private drawLetterTile(position: Coordinate, letter: string) {
        // this.gridContext.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(position.x, position.y, TILE_SIZE, TILE_SIZE);
        this.gridContext.font = 20 + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, position.x + TILE_SIZE / 2, TILE_SIZE / 2);
    }

    private drawLetterWeight(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = 20 / 2;
        this.gridContext.font = 20 * 0.45 + 'px system-ui';
        this.gridContext.fillText(string, x + TILE_SIZE / 2 + plusX, y + halfSize + TILE_SIZE / 2, 20);
    }
}
