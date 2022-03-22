import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { HttpHandlerService } from '@app/services/http-handler.service';

const TIMEOUT = 3000;

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
    highScoreClassic: HighScores[] | undefined;
    highScoreLOG29990: HighScores[] | undefined;
    constructor(private readonly httpHandler: HttpHandlerService, private snackBar: MatSnackBar) {}

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
    }

    openSnackBar(reason: string): void {
        this.snackBar.open(reason, 'fermer', {
            verticalPosition: 'top',
        });
    }
}
