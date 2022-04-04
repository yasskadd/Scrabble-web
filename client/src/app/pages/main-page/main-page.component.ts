import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxGameTypeComponent } from '@app/components/dialog-box-game-type/dialog-box-game-type.component';
import { DialogBoxHighScoresComponent } from '@app/components/dialog-box-high-scores/dialog-box-high-scores.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = "Bienvenue au jeu Scrabble de l'équipe 107";
    private readonly dialogWidth: string = '500px';
    private readonly dialogWidthHighScore: string = '500px';
    constructor(private dialog: MatDialog, private highScore: MatDialog) {}

    openDialog(gameModeValue: string): void {
        this.dialog.open(DialogBoxGameTypeComponent, {
            width: this.dialogWidth,
            data: gameModeValue,
        });
    }

    openHighScoreDialog(): void {
        this.highScore.open(DialogBoxHighScoresComponent, {
            width: this.dialogWidthHighScore,
            disableClose: true,
        });
    }
}
