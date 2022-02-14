/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import * as multipliers from '@common/board-multiplier-coords';
import * as constants from '@common/constants';
import { Coordinate } from '@common/coordinate';
import { Coordinate as LetterTile } from '@common/coordinate.class';
// import { LetterTile } from '@common/letter-tile.class';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 600;

const TILE_SIZE = 35;

export const FONT_SIZE = 16;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const POINTS_FONT_SIZE = FONT_SIZE * 0.45;
export const LETTER_TILE_RATIO = 0.8;
export const BEIGE = '#d2ccb8';
export const LIGHT_BLUE = '#CEE7F7';
export const DARK_BLUE = '#93cff1';
export const PINK = '#f0b8b8';
export const RED = '#FE6E54';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    static squareWidth = DEFAULT_WIDTH / constants.TOTAL_COLUMNS;
    static squareHeight = DEFAULT_HEIGHT / constants.TOTAL_ROWS;
    static letterTileWidth = GridService.squareWidth * LETTER_TILE_RATIO;
    static letterTileHeight = GridService.squareHeight * LETTER_TILE_RATIO;
    static halfSquareWidth = GridService.squareWidth / 2;
    static halfSquareHeight = GridService.squareHeight / 2;
    static middlePosWidth = GridService.squareWidth * 8;
    static middlePosHeight = GridService.squareHeight * 8;
    letterSize: number;
    letterPointsSize: number;

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    // private static wordMultiplyThree = [1, 8, 15];

    size: number;
    weightSize: number;
    gridContext: CanvasRenderingContext2D;
    constructor() {
        this.letterSize = FONT_SIZE;
        this.letterPointsSize = POINTS_FONT_SIZE;
        // TODO : remove after testing
    }

    drawGrid(gameboard: LetterTile[]) {
        this.drawRowNumbers();
        this.drawColumnLetters();
        this.drawBasicTiles();
        this.drawMultipliers();
        this.drawMiddleTile();
        gameboard.forEach((letterTile) => {
            if (letterTile.isOccupied) {
                this.drawLetter({ x: letterTile.x, y: letterTile.y }, letterTile.letter.value.toUpperCase());
                this.drawLetterWeight({ x: letterTile.x, y: letterTile.y }, String(letterTile.letter.points));
            }
        });
    }

    // this function would be similar to drawBasicTile from GridService.
    drawLetterTile(position: Coordinate, letter: string) {
        // this.gridContext.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(position.x, position.y, TILE_SIZE, TILE_SIZE);
        this.setFontSize(20);
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(letter, position.x + TILE_SIZE / 2, TILE_SIZE / 2);
    }

    drawLetterPoints(position: Coordinate, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = 20 / 2;
        this.gridContext.font = 20 * 0.45 + 'px system-ui';
        this.gridContext.fillText(string, position.x + TILE_SIZE / 2 + plusX, position.y + halfSize + TILE_SIZE / 2, 20);
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

    drawStar() {
        const SPIKES = 5;
        const INNER_RADIUS = 5;
        const OUTER_RADIUS = 10;
        let rotation = (Math.PI / 2) * 3;
        let x = GridService.middlePosWidth + GridService.halfSquareWidth;
        let y = GridService.middlePosHeight + GridService.halfSquareHeight;
        const step = Math.PI / SPIKES;
        this.gridContext.strokeStyle = 'black';
        this.gridContext.beginPath();
        this.gridContext.moveTo(
            GridService.middlePosWidth + GridService.halfSquareWidth,
            GridService.middlePosHeight + GridService.halfSquareHeight - OUTER_RADIUS,
        );
        for (let i = 0; i < SPIKES; i++) {
            x = GridService.middlePosWidth + GridService.halfSquareWidth + Math.cos(rotation) * OUTER_RADIUS;
            y = GridService.middlePosHeight + GridService.halfSquareHeight + Math.sin(rotation) * OUTER_RADIUS;
            this.gridContext.lineTo(x, y);
            rotation += step;
            x = GridService.middlePosWidth + GridService.halfSquareWidth + Math.cos(rotation) * INNER_RADIUS;
            y = GridService.middlePosHeight + GridService.halfSquareHeight + Math.sin(rotation) * INNER_RADIUS;
            this.gridContext.lineTo(x, y);
            rotation += step;
        }
        this.gridContext.lineTo(
            GridService.middlePosWidth + GridService.halfSquareWidth,
            GridService.middlePosHeight + GridService.halfSquareHeight - OUTER_RADIUS,
        );
        this.gridContext.closePath();
        this.gridContext.lineWidth = 5;
        this.gridContext.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.stroke();
        this.gridContext.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.fill();
    }

    // REFACTORED, but
    // TODO: remove magic numbers --------------------------------------------------------------------------------------------------

    drawRowNumbers() {
        this.setFontSize(this.letterSize);
        for (let i = 1; i < constants.TOTAL_COLUMNS; i++) {
            const position: Coordinate = { x: i, y: 0 };
            this.gridContext.textBaseline = 'middle';
            this.drawText(position, String(i));
        }
    }

    drawColumnLetters() {
        const chatCode = 64;
        for (let i = 1; i < constants.TOTAL_ROWS; i++) {
            const char = String.fromCharCode(chatCode + i);
            const position: Coordinate = { x: 0, y: i };
            // this.gridContext.fillStyle = 'black'; // possible refactor. this is already called in drawText
            this.drawLetter(position, char);
        }
    }

    drawLetter(position: Coordinate, char: string) {
        this.setFontSize(this.letterSize);
        this.gridContext.textBaseline = 'middle';
        this.drawText(position, char);
    }

    drawBasicTiles() {
        for (let i = 1; i < constants.TOTAL_COLUMNS; i++) {
            for (let j = 1; j < constants.TOTAL_ROWS; j++) {
                const position: Coordinate = { x: i, y: j };
                this.gridContext.strokeStyle = '#f9f7f2';
                this.drawBasicTile(position);
            }
        }
    }

    drawBasicTile(position: Coordinate) {
        this.gridContext.fillStyle = BEIGE;
        this.fillTile(position);
    }

    drawMultipliers() {
        multipliers.letterMultipliersByTwo.forEach((position) => {
            this.drawMultiplier(position, 2, 'LETTRE');
        });
        multipliers.letterMultipliersByThree.forEach((position) => {
            this.drawMultiplier(position, 3, 'LETTRE');
        });
        multipliers.wordMultipliersByTwo.forEach((position) => {
            this.drawMultiplier(position, 2, 'MOT');
        });
        multipliers.wordMultipliersByThree.forEach((position) => {
            this.drawMultiplier(position, 3, 'MOT');
        });
    }

    drawMultiplier(position: Coordinate, multiplier: number, type: string) {
        this.setTileColor(type, multiplier);
        this.fillTile(position);
        this.drawMultiplierType(position, type);
        this.drawMultiplierNumber(position, multiplier);
    }

    setTileColor(type: string, multiplier: number) {
        switch (type) {
            case 'LETTRE':
                this.gridContext.fillStyle = multiplier === 2 ? LIGHT_BLUE : DARK_BLUE;
                break;
            case 'MOT':
                this.gridContext.fillStyle = multiplier === 2 ? PINK : RED;
                break;
        }
    }

    drawMiddleTile() {
        const middlePosition: Coordinate = { x: 8, y: 8 };
        this.gridContext.fillStyle = '#f0b8b8';
        this.fillTile(middlePosition);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.drawStar();
    }

    fillTile(position: Coordinate) {
        this.gridContext.lineWidth = 1;
        this.gridContext.fillRect(
            GridService.squareWidth * position.x,
            GridService.squareWidth * position.y,
            GridService.squareWidth,
            GridService.squareHeight,
        );
        this.gridContext.strokeRect(
            GridService.squareWidth * position.x,
            GridService.squareWidth * position.y,
            GridService.squareWidth,
            GridService.squareHeight,
        );
    }

    drawMultiplierNumber(position: Coordinate, multiplier: number) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const size = this.letterSize * 0.6;
        this.setFontSize(size);
        this.gridContext.textBaseline = 'top';
        this.gridContext.textAlign = 'center';
        this.drawText(position, 'x ' + String(multiplier));
    }

    drawMultiplierType(position: Coordinate, type: string) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const size = this.letterSize * 0.55;
        this.setFontSize(size);
        this.gridContext.textBaseline = 'bottom';
        this.gridContext.textAlign = 'center';
        this.drawText(position, type);
    }

    drawText(position: Coordinate, content: string) {
        this.gridContext.fillStyle = 'black';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            content,
            GridService.squareWidth * position.x + GridService.halfSquareWidth,
            GridService.squareHeight * position.y + GridService.halfSquareHeight,
            GridService.squareWidth,
        );
    }

    setFontSize(size: number) {
        this.gridContext.font = size + 'px system-ui';
    }

    drawLetterWeight(position: Coordinate, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = this.size / 2;
        this.gridContext.font = this.weightSize + 'px system-ui';
        this.gridContext.fillText(
            string,
            GridService.squareWidth * position.x + GridService.halfSquareWidth + plusX,
            GridService.squareHeight * position.y + halfSize + GridService.halfSquareHeight,
            this.size,
        );
    }
}
