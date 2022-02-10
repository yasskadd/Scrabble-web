import { Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinate.class';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 600;
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
        // TODO : remove after testing
    }

    drawGridArray(gameboard: Coordinate[]) {
        this.drawRowNumbers();
        this.drawColumnAlphabet();
        gameboard.forEach((letter) => {
            this.drawTileLetter(letter);
        });
        const middlePos = this.positionXYPixel(7, 7);
        this.drawWordMultiplierByTwoTile(7, 7);
        this.drawStar(middlePos.x + GridService.halfSquareWidth, middlePos.y + GridService.halfSquareHeight, 5, 10, 5);
    }

    drawTileLetter(letter: Coordinate) {
        if (letter.letterMultiplier > 1) {
            if (letter.letterMultiplier === 2) {
                this.drawLetterMultiplierByTwoTile(letter.x, letter.y);
            } else {
                this.drawLetterMultiplierByThreeTile(letter.x, letter.y);
            }
            if (!letter.isOccupied) {
                this.drawMultiplierIcon(letter.x, letter.y, letter.letterMultiplier);
                this.drawMultiplierType(letter.x, letter.y, 'LETTRE');
            }
        } else if (letter.wordMultiplier > 1) {
            if (letter.wordMultiplier === 2) {
                this.drawWordMultiplierByTwoTile(letter.x, letter.y);
            } else {
                this.drawWordMultiplierByThreeTile(letter.x, letter.y);
            }
            if (!letter.isOccupied) {
                this.drawMultiplierIcon(letter.x, letter.y, letter.wordMultiplier);
                this.drawMultiplierType(letter.x, letter.y, 'MOT');
            }
        } else {
            this.drawBasicTile(letter.x, letter.y);
        }
        if (!letter.isOccupied) return;
        this.drawLetterTile(letter.x, letter.y, letter.letter.string);
        this.drawLetterWeight(letter.x, letter.y, `${letter.letter.points}`);
    }

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        for (let i = 1; i < SQUARES_NUMBER; i++) {
            for (let j = 1; j < SQUARES_NUMBER; j++) {
                this.drawBasicTile(GridService.squareWidth * i, GridService.squareHeight * j);
            }
        }
        this.drawRowNumbers();
        this.drawColumnAlphabet();
        const middlePos = this.positionXYPixel(8, 8);
        this.drawWordMultiplierByTwoTile(middlePos.x, middlePos.y);
        this.gridContext.fillStyle = 'black';
        this.drawStar(middlePos.x + GridService.halfSquareWidth, middlePos.y + GridService.halfSquareHeight, 5, 10, 5);
    }

    drawRowNumbers() {
        this.gridContext.font = this.size + 'px system-ui';
        for (let i = 1; i <= 15; i++) {
            this.gridContext.fillStyle = 'black';
            const positions = this.positionXYPixel(i - 1, -1);
            this.drawNumber(positions.x, positions.y, String(i));
        }
    }

    drawColumnAlphabet() {
        const chatCode = 64;
        for (let i = 1; i <= 15; i++) {
            const char = String.fromCharCode(chatCode + i);
            this.gridContext.fillStyle = 'black';
            const positions = this.positionXYPixel(-1, i - 1);
            this.drawLetter(positions.x, positions.y, char);
        }
    }

    drawBasicTile(x: number, y: number) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.fillStyle = '#D2CCB8';
        this.gridContext.fillRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#F9F7F2';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
    }

    drawWordMultiplierByThreeTile(x: number, y: number) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.fillStyle = '#FE6E54';
        this.gridContext.fillRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#F9F7F2';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
    }

    drawWordMultiplierByTwoTile(x: number, y: number) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.fillStyle = '#F0B8B8';
        this.gridContext.fillRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#F9F7F2';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
    }

    drawLetterMultiplierByThreeTile(x: number, y: number) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.fillStyle = '#93CFF1';
        this.gridContext.fillRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#F9F7F2';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
    }

    drawLetterMultiplierByTwoTile(x: number, y: number) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.fillStyle = '#CEE7F7';
        this.gridContext.fillRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
        this.gridContext.strokeStyle = '#F9F7F2';
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeRect(positions.x, positions.y, GridService.squareWidth, GridService.squareHeight);
    }

    drawNumber(x: number, y: number, string: string) {
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(string, x + GridService.halfSquareWidth, y + GridService.halfSquareHeight, this.size);
    }

    drawLetterWeight(x: number, y: number, string: string) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        const width = this.gridContext.measureText(string).width;
        const plusX = width * 0.9;
        const halfSize = this.size / 2;
        this.gridContext.font = this.weightSize + 'px system-ui';
        this.gridContext.fillText(
            string,
            positions.x + GridService.halfSquareWidth + plusX,
            positions.y + halfSize + GridService.halfSquareHeight,
            this.size,
        );
    }

    drawLetter(x: number, y: number, char: string) {
        this.gridContext.font = this.size + 'px system-ui';
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        // console.log(positions);
        this.gridContext.fillStyle = 'black';
        this.gridContext.fillText(char, GridService.halfSquareWidth + x, GridService.halfSquareHeight + y, GridService.squareWidth);
    }

    drawLetterTile(x: number, y: number, char: string) {
        const positions = this.positionXYPixel(x, y);
        this.gridContext.lineWidth = 1;
        this.gridContext.strokeStyle = 'black';
        const posX = (GridService.squareWidth - GridService.letterTileWidth) / 2;
        const posY = (GridService.squareHeight - GridService.letterTileHeight) / 2;
        this.gridContext.strokeRect(positions.x + posX, positions.y + posY, GridService.letterTileWidth, GridService.letterTileHeight);
        this.gridContext.fillStyle = 'black';
        this.drawLetter(positions.x, positions.y, char);
    }

    drawMultiplierIcon(x: number, y: number, multiplier: number) {
        const positions = this.positionXYPixel(x, y);
        const size = this.size * 0.6;
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = size + 'px system-ui';
        this.gridContext.textBaseline = 'top';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            'x ' + String(multiplier),
            GridService.halfSquareWidth + positions.x,
            GridService.halfSquareHeight + positions.y,
            GridService.squareWidth,
        );
    }

    drawMultiplierType(x: number, y: number, type: string) {
        const positions = this.positionXYPixel(x, y);
        const size = this.size * 0.55;
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = size + 'px system-ui';
        this.gridContext.textBaseline = 'bottom';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            type,
            GridService.halfSquareWidth + positions.x,
            GridService.halfSquareHeight + positions.y,
            GridService.squareWidth,
        );
    }

    drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        this.gridContext.strokeStyle = 'black';
        this.gridContext.beginPath();
        this.gridContext.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.gridContext.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.gridContext.lineTo(x, y);
            rot += step;
        }
        this.gridContext.lineTo(cx, cy - outerRadius);
        this.gridContext.closePath();
        this.gridContext.lineWidth = 5;
        this.gridContext.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.stroke();
        this.gridContext.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.gridContext.fill();
    }

    private positionXYPixel(x: number, y: number): Coord {
        return { x: GridService.squareWidth * (x + 1), y: GridService.squareHeight * (y + 1) };
    }
}
