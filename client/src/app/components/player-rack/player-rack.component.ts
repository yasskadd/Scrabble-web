import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GridService } from '@app/services/grid.service';

export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 45;
const TILE_SIZE = 35;
const RACK_LETTERS = 7;

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent implements AfterViewInit {
    @ViewChild('rackCanvas', { static: false }) private rackCanvas!: ElementRef<HTMLCanvasElement>;

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(public gridService: GridService) {}

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.rackCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawLettersOnRack();
        this.rackCanvas.nativeElement.focus();
    }

    drawLettersOnRack() {
        for (let i = 0; i < RACK_LETTERS; i++) {
            this.gridService.drawLetterTile({ x: DEFAULT_WIDTH * 0.25 + TILE_SIZE * i, y: 1 }, 'A');
            this.gridService.drawLetterPoints(TILE_SIZE * i + DEFAULT_WIDTH * 0.25, 0, '1');
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
