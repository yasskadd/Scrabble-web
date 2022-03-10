import { Injectable } from '@angular/core';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';

@Injectable({
    providedIn: 'root',
})
export class LetterPlacementService {
    constructor(private gridService: GridService, private gameClientService: GameClientService) {
        this.gameClientService.gameboardUpdated.subscribe(() => {
            this.resetGameBoardView();
        });
    }

    resetGameBoardView() {
        this.gridService.drawGrid(this.gameClientService.gameboard);
    }
    setCanvas(canvas: CanvasRenderingContext2D) {
        this.gridService.gridContext = canvas;
    }
}
