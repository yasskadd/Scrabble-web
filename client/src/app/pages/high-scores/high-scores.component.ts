import { Component, OnInit } from '@angular/core';
import { HighScores } from '@app/classes/high-score-parameters';
import { HttpHandlerService } from '@app/services/http-handler.service';

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
    highScoreClassic: HighScores[];
    highScoreLOG29990: HighScores[];
    constructor(private readonly httpHandler: HttpHandlerService) {}

    ngOnInit(): void {
        this.getHighScores();
    }

    getHighScores() {
        this.httpHandler.getClassicHighScore().subscribe((highScore) => (this.highScoreClassic = highScore));
        this.httpHandler.getLOG2990HighScore().subscribe((highScore) => (this.highScoreLOG29990 = highScore));
    }
}
