import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GridService } from '@app/services/grid.service';

export const DEFAULT_WIDTH = 610;
export const DEFAULT_HEIGHT = 750;

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

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private readonly gridService: GridService, private chatBoxHandler: ChatboxHandlerService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        // this.gridService.drawGrid();
        // this.gridService.drawWord('Scrabble');

        this.gridCanvas.nativeElement.focus();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    skipTurn() {
        this.chatBoxHandler.submitMessage('!passer');
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }
}
