import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '@app/components/dialog-box/dialog-box.component';
import { HighScoresComponent } from '@app/components/high-scores/high-scores.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = "Bienvenue au jeu Scrabble de l'équipe 107";
    private readonly dialogWidth: string = '25%';
    private readonly dialogWidthHighScore: string = '50%';
    constructor(private dialog: MatDialog, private highScore: MatDialog) {}

    openDialog(gameModeValue: string): void {
        this.dialog.open(DialogBoxComponent, {
            width: this.dialogWidth,
            data: gameModeValue,
        });
    }

    openHighScoreDialog(): void {
        this.highScore.open(HighScoresComponent, {
            width: this.dialogWidthHighScore,
            disableClose: true,
        });
    }
}
