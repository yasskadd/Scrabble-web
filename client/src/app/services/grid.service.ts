import { Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinate';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 600;
export const TOTAL_COLUMNS = 16;
export const TOTAL_ROWS = 16;
export const FONT_SIZE = 16;
export const POINTS_FONT_SIZE = FONT_SIZE * 0.45;
export const LETTER_TILE_RATIO = 0.8;
export const BEIGE = '#D2CCB8';
export const LIGHT_BLUE = '#CEE7F7';
export const DARK_BLUE = '#93CFF1';
export const PINK = '#F0B8B8';
export const RED = '#FE6E54';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    private static squareWidth = DEFAULT_WIDTH / TOTAL_COLUMNS;
    private static squareHeight = DEFAULT_HEIGHT / TOTAL_ROWS;
    private static letterTileWidth = GridService.squareWidth * LETTER_TILE_RATIO;
    private static letterTileHeight = GridService.squareHeight * LETTER_TILE_RATIO;
    private static halfSquareWidth = GridService.squareWidth / 2;
    private static halfSquareHeight = GridService.squareHeight / 2;
    private static middlePosWidth = GridService.squareWidth * 8;
    private static middlePosHeight = GridService.squareHeight * 8;

    letterSize: number;
    letterPointsSize: number;
    gridContext: CanvasRenderingContext2D;

    constructor() {
        this.letterSize = FONT_SIZE;
        this.letterPointsSize = POINTS_FONT_SIZE;
    }

    drawLetterTile(position: Coordinate, char: string) {
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeStyle = 'Black';
        const posX = (GridService.squareWidth - GridService.letterTileWidth) / 2;
        const posY = (GridService.squareHeight - GridService.letterTileHeight) / 2;
        this.gridContext.strokeRect(position.x + posX, position.y + posY, GridService.letterTileWidth, GridService.letterTileHeight);
        this.gridContext.fillStyle = 'black';
        this.drawLetter(position, char);
    }

    drawLetterPoints(position: Coordinate, string: string) {
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

    drawStar(spikes: number, outerRadius: number, innerRadius: number) {
        let rotation = (Math.PI / 2) * 3;
        let x = GridService.middlePosWidth + GridService.halfSquareWidth;
        let y = GridService.middlePosHeight + GridService.halfSquareHeight;
        const step = Math.PI / spikes;
        this.gridContext.strokeStyle = 'black';
        this.gridContext.beginPath();
        this.gridContext.moveTo(
            GridService.middlePosWidth + GridService.halfSquareWidth,
            GridService.middlePosHeight + GridService.halfSquareHeight - outerRadius,
        );
        for (let i = 0; i < spikes; i++) {
            x = GridService.middlePosWidth + GridService.halfSquareWidth + Math.cos(rotation) * outerRadius;
            y = GridService.middlePosHeight + GridService.halfSquareHeight + Math.sin(rotation) * outerRadius;
            this.gridContext.lineTo(x, y);
            rotation += step;
            x = GridService.middlePosWidth + GridService.halfSquareWidth + Math.cos(rotation) * innerRadius;
            y = GridService.middlePosHeight + GridService.halfSquareHeight + Math.sin(rotation) * innerRadius;
            this.gridContext.lineTo(x, y);
            rotation += step;
        }
        this.gridContext.lineTo(
            GridService.middlePosWidth + GridService.halfSquareWidth,
            GridService.middlePosHeight + GridService.halfSquareHeight - outerRadius,
        );
        this.gridContext.closePath();
        this.gridContext.lineWidth = 5;
        this.gridContext.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.stroke();
        this.gridContext.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.fill();
    }

    // REFACTORED, but TODO: remove magic numbers ----------------------------------------------------------------------------------------------------------------------
    drawGrid() {
        this.drawRowNumbers();
        this.drawColumnLetters();
        this.drawBasicTiles();
        this.drawMultipliers();
        this.drawMiddleTile();
    }

    private drawRowNumbers() {
        this.setFontSize(this.letterSize);
        for (let i = 1; i < TOTAL_COLUMNS; i++) {
            const position: Coordinate = { x: i, y: 0 };
            this.gridContext.textBaseline = 'middle';
            this.drawText(position, String(i));
        }
    }

    private drawColumnLetters() {
        const chatCode = 64;
        for (let i = 1; i <= TOTAL_ROWS; i++) {
            const char = String.fromCharCode(chatCode + i);
            const position: Coordinate = { x: 0, y: i };
            this.gridContext.fillStyle = 'black';
            this.drawLetter(position, char);
        }
    }

    private drawLetter(position: Coordinate, char: string) {
        this.setFontSize(this.letterSize);
        this.gridContext.textBaseline = 'middle';
        this.drawText(position, char);
    }

    private drawBasicTiles() {
        for (let i = 1; i < TOTAL_COLUMNS; i++) {
            for (let j = 1; j < TOTAL_ROWS; j++) {
                const position: Coordinate = { x: i, y: j };
                this.gridContext.strokeStyle = '#F9F7F2';
                this.drawBasicTile(position);
            }
        }
    }

    private drawBasicTile(position: Coordinate) {
        this.gridContext.fillStyle = BEIGE;
        this.fillTile(position);
    }

    private drawMultipliers() {
        //TODO: PUT ELSEWHERE
        const letterMultipliersByTwo: Coordinate[] = [
            { x: 4, y: 1 },
            { x: 12, y: 1 },
            { x: 7, y: 3 },
            { x: 9, y: 3 },
            { x: 1, y: 4 },
            { x: 8, y: 2 },
            { x: 15, y: 4 },
            { x: 3, y: 7 },
            { x: 7, y: 7 },
            { x: 9, y: 7 },
            { x: 13, y: 7 },
            { x: 4, y: 8 },
            { x: 12, y: 8 },
            { x: 3, y: 9 },
            { x: 7, y: 9 },
            { x: 9, y: 9 },
            { x: 13, y: 9 },
            { x: 1, y: 12 },
            { x: 8, y: 12 },
            { x: 15, y: 12 },
            { x: 7, y: 13 },
            { x: 9, y: 13 },
            { x: 4, y: 15 },
            { x: 12, y: 15 },
        ];

        const letterMultipliersByThree: Coordinate[] = [
            { x: 6, y: 2 },
            { x: 10, y: 2 },
            { x: 2, y: 6 },
            { x: 6, y: 6 },
            { x: 10, y: 6 },
            { x: 14, y: 6 },
            { x: 2, y: 10 },
            { x: 6, y: 10 },
            { x: 10, y: 10 },
            { x: 14, y: 10 },
            { x: 6, y: 14 },
            { x: 10, y: 14 },
        ];

        const wordMultipliersByTwo: Coordinate[] = [
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
            { x: 11, y: 5 },
            { x: 12, y: 4 },
            { x: 13, y: 3 },
            { x: 14, y: 2 },
            { x: 2, y: 14 },
            { x: 3, y: 13 },
            { x: 4, y: 12 },
            { x: 5, y: 11 },
            { x: 11, y: 11 },
            { x: 12, y: 12 },
            { x: 13, y: 13 },
            { x: 14, y: 14 },
        ];

        const wordMultipliersByThree: Coordinate[] = [
            { x: 1, y: 1 },
            { x: 8, y: 1 },
            { x: 15, y: 1 },
            { x: 1, y: 8 },
            { x: 15, y: 8 },
            { x: 1, y: 15 },
            { x: 8, y: 15 },
            { x: 15, y: 15 },
        ];

        letterMultipliersByTwo.forEach((position) => {
            this.drawMultiplier(position, 2, 'LETTRE');
        });
        letterMultipliersByThree.forEach((position) => {
            this.drawMultiplier(position, 3, 'LETTRE');
        });
        wordMultipliersByTwo.forEach((position) => {
            this.drawMultiplier(position, 2, 'MOT');
        });
        wordMultipliersByThree.forEach((position) => {
            this.drawMultiplier(position, 3, 'MOT');
        });
    }

    private drawMultiplier(position: Coordinate, multiplier: number, type: string) {
        this.setTileColor(type, multiplier);
        this.fillTile(position);
        this.drawMultiplierType(position, type);
        this.drawMultiplierNumber(position, multiplier);
    }

    private setTileColor(type: string, multiplier: number) {
        switch (type) {
            case 'LETTRE':
                multiplier === 2 ? (this.gridContext.fillStyle = LIGHT_BLUE) : (this.gridContext.fillStyle = DARK_BLUE);
                break;
            case 'MOT':
                multiplier === 2 ? (this.gridContext.fillStyle = PINK) : (this.gridContext.fillStyle = RED);
                break;
        }
    }

    private drawMiddleTile() {
        const middlePosition: Coordinate = { x: 8, y: 8 };
        this.gridContext.fillStyle = '#F0B8B8';
        this.fillTile(middlePosition);
        this.drawStar(5, 10, 5);
    }

    private fillTile(position: Coordinate) {
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

    private drawMultiplierNumber(position: Coordinate, multiplier: number) {
        const size = this.letterSize * 0.6;
        this.setFontSize(size);
        this.gridContext.textBaseline = 'top';
        this.gridContext.textAlign = 'center';
        this.drawText(position, 'x ' + String(multiplier));
    }

    private drawMultiplierType(position: Coordinate, type: string) {
        const size = this.letterSize * 0.55;
        this.setFontSize(size);
        this.gridContext.textBaseline = 'bottom';
        this.gridContext.textAlign = 'center';
        this.drawText(position, type);
    }

    private drawText(position: Coordinate, content: string) {
        this.gridContext.fillStyle = 'black';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            content,
            GridService.squareWidth * position.x + GridService.halfSquareWidth,
            GridService.squareHeight * position.y + GridService.halfSquareHeight,
            GridService.squareWidth,
        );
    }

    private setFontSize(size: number) {
        this.gridContext.font = size + 'px system-ui';
    }

    clearTile(position: Coordinate) {
        this.gridContext.clearRect(GridService.squareWidth * position.x, position.y, GridService.squareWidth, GridService.squareHeight);
    }
}
