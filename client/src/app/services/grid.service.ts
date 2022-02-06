import { Injectable } from '@angular/core';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;
// Better organize later
const SQUARES_NUMBER = 16;
const LETTER_TILE_RATIO = 0.8;

type Coord = { x: number; y: number };
@Injectable({
    providedIn: 'root',
})
export class GridService {
    private static squareWidth = DEFAULT_WIDTH / SQUARES_NUMBER;
    private static squareHeight = DEFAULT_HEIGHT / SQUARES_NUMBER;
    private static letterTileWidth = GridService.squareWidth * LETTER_TILE_RATIO;
    private static letterTileHeight = GridService.squareHeight * LETTER_TILE_RATIO;
    private static halfSquareWidth = GridService.squareWidth / 2;
    private static halfSquareHeight = GridService.squareHeight / 2;

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    // private static wordMultiplyThree = [1, 8, 15];

    size: number;
    weightSize: number;
    gridContext: CanvasRenderingContext2D;
    constructor() {
        this.size = 15;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.weightSize = this.size * 0.45;
    }

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        for (let i = 1; i <= SQUARES_NUMBER; i++) {
            for (let j = 1; j <= SQUARES_NUMBER; j++) {
                this.drawBasicTile(GridService.squareWidth * i, GridService.squareHeight * j);
            }
        }
        let positions = this.positionXYPixel(2, 1);
        this.drawRowNumbers();
        this.drawColumnAlphabet();
        // this.drawWordMultiplierByThreeTile(positions.x, positions.y);
        positions = this.positionXYPixel(4, 1);
        this.drawWordMultiplierByTwoTile(positions.x, positions.y);

        this.drawLetterTile(GridService.squareWidth * 5, GridService.squareHeight * 1, 'B');
        this.drawLetterWeight(GridService.squareWidth * 5, GridService.squareHeight * 1, '4');
        this.drawMultiplierIcon(GridService.squareWidth * 5, GridService.squareHeight * 7, 5);
        this.drawMultiplierType(GridService.squareWidth * 5, GridService.squareHeight * 7, 'LETTRE');
        // this.drawMultipliers();
    }

    drawRowNumbers() {
        this.gridContext.font = this.size + 'px system-ui';
        for (let i = 1; i <= 15; i++) {
            this.gridContext.fillStyle = 'black';
            const positions = this.positionXYPixel(i, 0);
            this.drawNumber(positions.x, positions.y, String(i));
        }
    }

    drawColumnAlphabet() {
        const chatCode = 64;
        for (let i = 1; i <= 15; i++) {
            const char = String.fromCharCode(chatCode + i);
            this.gridContext.fillStyle = 'black';
            const positions = this.positionXYPixel(0, i);
            this.drawLetter(positions.x, positions.y, char);
        }
    }

    // drawMultipliers() {
    //     let positions: Coord;
    //     for (const x of GridService.wordMultiplyThree) {
    //         for (const y of GridService.wordMultiplyThree) {
    //             positions = this.positionXYPixel(x, y);
    //             this.drawWordMultiplierByThreeTile(positions.x, positions.y);
    //             this.drawMultiplierIcon(positions.x, positions.y, 3);
    //             this.drawMultiplierType(positions.x, positions.y, 'WORD');
    //         }
    //     }
    // }
    drawBasicTile(x: number, y: number) {
        this.gridContext.fillStyle = '#FADD7A';
        this.gridContext.fillRect(x, y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#C7A121';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, GridService.squareWidth, GridService.squareHeight);
    }

    drawWordMultiplierByThreeTile(x: number, y: number) {
        this.gridContext.fillStyle = '#FA5F55';
        this.gridContext.fillRect(x, y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#80461B';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, GridService.squareWidth, GridService.squareHeight);
    }

    drawWordMultiplierByTwoTile(x: number, y: number) {
        this.gridContext.fillStyle = '#FAA0A0';
        this.gridContext.fillRect(x, y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#117C04';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, GridService.squareWidth, GridService.squareHeight);
    }

    drawLetterMultiplierByThreeTile(x: number, y: number) {
        this.gridContext.fillStyle = '#78AED3';
        this.gridContext.fillRect(x, y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#80461B';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, GridService.squareWidth, GridService.squareHeight);
    }

    drawLetterMultiplierByTwoTile(x: number, y: number) {
        this.gridContext.fillStyle = '#C1E3ED';
        this.gridContext.fillRect(x, y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#117C04';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(x, y, GridService.squareWidth, GridService.squareHeight);
    }

    drawNumber(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(string, x + GridService.halfSquareWidth, y + GridService.halfSquareHeight, this.size);
    }

    drawLetterWeight(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = this.size / 2;
        this.gridContext.font = this.weightSize + 'px system-ui';
        this.gridContext.fillText(string, x + GridService.halfSquareWidth + plusX, y + halfSize + GridService.halfSquareHeight, this.size);
    }

    drawLetter(x: number, y: number, char: string) {
        this.gridContext.font = this.size + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(char, GridService.halfSquareWidth + x, GridService.halfSquareHeight + y, GridService.squareWidth);
    }

    drawLetterTile(x: number, y: number, char: string) {
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeStyle = 'Black';
        const posX = (GridService.squareWidth - GridService.letterTileWidth) / 2;
        const posY = (GridService.squareHeight - GridService.letterTileHeight) / 2;
        this.gridContext.strokeRect(x + posX, y + posY, GridService.letterTileWidth, GridService.letterTileHeight);
        this.gridContext.fillStyle = 'black';
        this.drawLetter(x, y, char);
    }

    drawMultiplierIcon(x: number, y: number, multiplier: number) {
        const size = this.size * 0.6;
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = size + 'px system-ui';
        this.gridContext.textBaseline = 'top';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            'x ' + String(multiplier),
            GridService.halfSquareWidth + x,
            GridService.halfSquareHeight + y,
            GridService.squareWidth,
        );
    }

    drawMultiplierType(x: number, y: number, type: string) {
        const size = this.size * 0.55;
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = size + 'px system-ui';
        this.gridContext.textBaseline = 'bottom';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(type, GridService.halfSquareWidth + x, GridService.halfSquareHeight + y, GridService.squareWidth);
    }

    clearTile(x: number, y: number) {
        const position = this.positionXYPixel(x, y);

        this.gridContext.clearRect(position.x, position.y, GridService.squareWidth, GridService.squareHeight);
    }

    private positionXYPixel(x: number, y: number): Coord {
        return { x: GridService.squareWidth * x, y: GridService.squareHeight * y };
    }
}
