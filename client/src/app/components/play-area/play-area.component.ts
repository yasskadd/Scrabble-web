import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as constants from '@app/constants';
import { Vec2 } from '@app/interfaces/vec2';
import { GridService } from '@app/services/grid.service';
import { Subject } from 'rxjs';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;

    keyboardParentSubject: Subject<KeyboardEvent> = new Subject();
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    private canvasSize = { x: constants.GRID_CANVAS_WIDTH, y: constants.GRID_CANVAS_HEIGHT };

    constructor(private readonly gridService: GridService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        this.keyboardParentSubject.next(event);
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }
}
