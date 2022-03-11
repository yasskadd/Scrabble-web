import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import * as constants from '@app/constants';
import { LetterPlacementService } from '@app/services/letter-placement.service';

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

    constructor(private letterService: LetterPlacementService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        switch (this.buttonPressed) {
            case 'Backspace': {
                this.letterService.undoPlacement();
                break;
            }
            case 'Enter': {
                this.letterService.submitPlacement();
                break;
            }
            case 'Shift': {
                break;
            }
            case 'Escape': {
                this.letterService.undoEverything();
                break;
            }
            default: {
                this.letterService.handlePlacement(this.buttonPressed);
                break;
            }
        }
    }

    @HostListener('document:click', ['$event'])
    mouseClickOutside(event: MouseEvent) {
        if (!this.gridCanvas.nativeElement.contains(event.target as Node)) this.letterService.undoEverything();
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.letterService.placeLetterStartPosition(this.mousePosition);
        }
    }

    ngAfterViewInit(): void {
        this.letterService.setCanvas(this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    }

    get width(): number {
        return constants.GRID_CANVAS_WIDTH;
    }

    get height(): number {
        return constants.GRID_CANVAS_HEIGHT;
    }
}
