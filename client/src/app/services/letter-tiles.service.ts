import { Injectable } from '@angular/core';
import * as constants from '@app/constants';
import { Letter } from '@common/letter';

@Injectable({
    providedIn: 'root',
})
export class LetterTilesService {
    minimumSize: number;
    maxSize: number;
    gridContext: CanvasRenderingContext2D;

    fontSize: number;

    constructor() {
        this.fontSize = constants.FONT_SIZE;
    }

    drawRack(letters: Letter[]) {
        this.gridContext.fillStyle = '#f8ebd9';
        this.gridContext.fillRect(0, 0, constants.LETTER_CANVAS_WIDTH, constants.LETTER_CANVAS_HEIGHT);
        this.gridContext.fillStyle = 'black';
        letters.forEach((letter, i) => {
            this.drawLetterTile(
                constants.LETTER_CANVAS_WIDTH / constants.LETTER_TILE_SIZE + constants.LETTER_TILE_SIZE * i,
                1,
                letter.value.toUpperCase(),
            );
            this.drawLetterWeight(
                constants.LETTER_CANVAS_WIDTH / constants.LETTER_TILE_SIZE + constants.LETTER_TILE_SIZE * i,
                0,
                String(letter.points),
            );
        });
    }

    drawLetterTile(x: number, y: number, letter: string) {
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, constants.LETTER_TILE_SIZE, constants.LETTER_TILE_SIZE);
        this.gridContext.font = this.fontSize + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, x + constants.LETTER_TILE_SIZE / 2, constants.LETTER_TILE_SIZE / 2);
    }

    drawLetterWeight(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'left';
        const width = this.gridContext.measureText(string).width;
        const a = constants.LETTER_TILE_SIZE / 2;
        const plusX = Math.abs(a - width);
        // const plusX = width * ratio;
        const halfSize = this.fontSize / 2;
        this.gridContext.font = this.fontSize * constants.MULTIPLIER_NUMBER_RATIO + 'px system-ui';
        this.gridContext.fillText(string, x + constants.LETTER_TILE_SIZE / 2 + plusX, y + halfSize + constants.LETTER_TILE_SIZE / 2);
    }
}
