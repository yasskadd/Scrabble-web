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

    async ngOnInit() {
        await this.httpHandler.getClassicHighScore().then((result) => {
            this.highScoreClassic = result;
        });

        await this.httpHandler.getLOG2990cHighScore().then((result) => {
            this.highScoreLOG29990 = result;
        });
    }
}
