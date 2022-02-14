import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LetterTilesService } from '@app/services/letter-tiles.service';

export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 45;

@Component({
    selector: 'app-player-rack',
    templateUrl: './player-rack.component.html',
    styleUrls: ['./player-rack.component.scss'],
})
export class PlayerRackComponent implements AfterViewInit {
    @ViewChild('rackCanvas', { static: false }) private rackCanvas!: ElementRef<HTMLCanvasElement>;

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(public letterTilesService: LetterTilesService) {}

    ngAfterViewInit(): void {
        this.letterTilesService.gridContext = this.rackCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.rackCanvas.nativeElement.focus();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
