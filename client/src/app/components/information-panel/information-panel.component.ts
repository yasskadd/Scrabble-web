import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Router } from '@angular/router';
import { AbandonGameDialogBoxComponent } from '@app/components/abandon-game-dialog-box/abandon-game-dialog-box.component';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { TimerService } from '@app/services/timer.service';

@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent {
    value: number;
    private readonly dialogWidth: string = '40%';

    constructor(
        public gameClientService: GameClientService,
        public timer: TimerService,
        private gridService: GridService,
        private letterService: LetterPlacementService,
        private dialog: MatDialog,
        private router: Router,
    ) {}

    formatLabel(value: number): string {
        return value + 'px';
    }

    updateFontSize(event: MatSliderChange): void {
        this.gridService.letterSize = event.value as number;
        this.gameClientService.updateGameboard();
        this.letterService.resetGameBoardView();
    }

    abandonGame(): void {
        this.dialog.open(AbandonGameDialogBoxComponent, {
            width: this.dialogWidth,
            panelClass: 'abandonDialogComponent',
            disableClose: true,
        });
    }
    leaveGame(): void {
        this.router.navigate(['/home']);
        this.gameClientService.quitGame();
    }
}
