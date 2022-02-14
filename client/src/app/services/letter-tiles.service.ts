import { Injectable } from '@angular/core';
import { Letter } from '@common/letter';

const TILE_SIZE = 40;
export const DEFAULT_WIDTH = 300;
export const DEFAULT_HEIGHT = 75;
const FONT_SIZE = 20;
const X_DIFFERENCE = 100;
const CONTAINER_WIDTH = 300;
@Injectable({
    providedIn: 'root',
})
export class LetterTilesService {
    minimumSize: number;
    maxSize: number;
    gridContext: CanvasRenderingContext2D;

    constructor() {
        this.minimumSize = 15;
        this.maxSize = 20;
    }

    drawRack(letters: Letter[]) {
        this.gridContext.fillStyle = '#f8ebd9';
        this.gridContext.fillRect(X_DIFFERENCE, 0, CONTAINER_WIDTH, DEFAULT_HEIGHT);
        this.gridContext.fillStyle = 'black';
        letters.forEach((letter, i) => {
            this.drawLetterTile(DEFAULT_WIDTH / TILE_SIZE + TILE_SIZE * i, 1, letter.value);
            this.drawLetterWeight(DEFAULT_WIDTH / TILE_SIZE + TILE_SIZE * i, 0, String(letter.points));
        });
    }

    // this function would be similar to drawBasicTile from GridService.
    drawLetterTile(x: number, y: number, letter: string) {
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridContext.font = FONT_SIZE + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, x + TILE_SIZE / 2, TILE_SIZE / 2);
    }

    drawLetterWeight(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = FONT_SIZE / 2;
        this.gridContext.font = FONT_SIZE * 0.45 + 'px system-ui';
        this.gridContext.fillText(string, x + TILE_SIZE / 2 + plusX, y + halfSize + TILE_SIZE / 2, 20);
    }
}
