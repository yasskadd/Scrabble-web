import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Router } from '@angular/router';
import { DialogBoxAbandonGameComponent } from '@app/components/dialog-box-abandon-game/dialog-box-abandon-game.component';
import { DialogGameHelpComponent } from '@app/components/dialog-game-help/dialog-game-help.component';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { TimerService } from '@app/services/timer.service';
import { Objective } from '@common/interfaces/objective';

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
        this.dialog.open(DialogBoxAbandonGameComponent, {
            width: this.dialogWidth,
            panelClass: 'abandonDialogComponent',
            disableClose: true,
        });
    }

    leaveGame(): void {
        this.router.navigate(['/home']);
        this.gameClientService.quitGame();
    }

    openHelpDialog() {
        this.dialog.open(DialogGameHelpComponent, { width: '50%' });
    }

    filterCompleteObjectives() {
        const objectives: Objective[] = this.gameClientService.playerOne.objective as Objective[];
        if (objectives) return objectives.filter((objective) => objective.complete);
        else return [];
    }
}
