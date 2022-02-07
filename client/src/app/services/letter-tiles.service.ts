import { Injectable } from '@angular/core';
const RACK_LETTERS = 7;
const TILE_SIZE = 35;

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

    drawRack() {
        for (let i = 0; i < RACK_LETTERS; i++) {
            this.drawLetterTile(TILE_SIZE * i, 1, 'A');
        }
    }

    // this function would be similar to drawBasicTile from GridService.
    drawLetterTile(x: number, y: number, letter: string) {
        // this.gridContext.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridContext.font = 20 + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, x, y);
    }

    // drawLetterWeight(letter: Letter) {
    //   this.gridContext.
    // }
}
