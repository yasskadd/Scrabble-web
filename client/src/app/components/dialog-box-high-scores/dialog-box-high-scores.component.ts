import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';

// import { HighScoresService } from '@app/services/high-scores.service';
const TIMEOUT = 3000;

@Component({
    selector: 'app-dialog-box-high-scores',
    templateUrl: './dialog-box-high-scores.component.html',
    styleUrls: ['./dialog-box-high-scores.component.scss'],
})
export class DialogBoxHighScoresComponent implements OnInit {
    highScoreClassic: HighScores[] | undefined;
    highScoreLOG29990: HighScores[] | undefined;
    constructor(private readonly httpHandler: HttpHandlerService, private snackBar: MatSnackBar) {
        // this.highScoreClassic = highScoreService.highScoreClassic;
        // this.highScoreLOG29990 = highScoreService.highScoreLOG29990;
    }
    // public highScoreService: HighScoresService
    ngOnInit(): void {
        this.getHighScores();
    }

    getHighScores() {
        this.httpHandler.getClassicHighScore().subscribe((highScore) => (this.highScoreClassic = highScore));
        this.httpHandler.getLOG2990HighScore().subscribe((highScore) => (this.highScoreLOG29990 = highScore));
        setTimeout(() => {
            if (this.highScoreClassic === undefined && this.highScoreLOG29990 === undefined)
                this.openSnackBar("Impossible de reçevoir l'information du serveur");
        }, TIMEOUT);
        // this.highScoreService.getHighScores();
    }

    openSnackBar(reason: string): void {
        this.snackBar.open(reason, 'fermer', {
            verticalPosition: 'top',
        });
    }
}
