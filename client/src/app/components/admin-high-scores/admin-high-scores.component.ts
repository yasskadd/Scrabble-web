import { Component, OnInit } from '@angular/core';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { HighScoresService } from '@app/services/high-scores.service';

// const TIMEOUT = 3000;

@Component({
    selector: 'app-admin-high-scores',
    templateUrl: './admin-high-scores.component.html',
    styleUrls: ['./admin-high-scores.component.scss'],
})
export class AdminHighScoresComponent implements OnInit {
    highScoreClassic: HighScores[] | undefined;
    highScoreLOG29990: HighScores[] | undefined;
    constructor(public highScoreService: HighScoresService) {
        this.highScoreClassic = highScoreService.highScoreClassic;
        this.highScoreLOG29990 = highScoreService.highScoreLOG29990;
    }
    // private readonly httpHandler: HttpHandlerService, private snackBar: MatSnackBar
    ngOnInit(): void {
        this.getHighScores();
    }

    getHighScores() {
        // this.httpHandler.getClassicHighScore().subscribe((highScore) => (this.highScoreClassic = highScore));
        // this.httpHandler.getLOG2990HighScore().subscribe((highScore) => (this.highScoreLOG29990 = highScore));
        // setTimeout(() => {
        //     if (this.highScoreClassic === undefined && this.highScoreLOG29990 === undefined)
        //         this.openSnackBar("Impossible de reçevoir l'information du serveur");
        // }, TIMEOUT);
        this.highScoreService.getHighScores();
    }

    // openSnackBar(reason: string): void {
    //     this.snackBar.open(reason, 'fermer', {
    //         verticalPosition: 'top',
    //     });
    // }

    // resetHighScores() {
    //     this.httpHandler
    //         .resetHighScores()
    //         .toPromise()
    //         .then(() => this.getHighScores());
    // }

    resetHighScores() {
        this.highScoreService.resetHighScores();
    }
}
