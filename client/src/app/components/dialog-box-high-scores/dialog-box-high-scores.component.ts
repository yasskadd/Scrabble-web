import { Component, OnInit } from '@angular/core';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { HighScoresService } from '@app/services/high-scores.service';

@Component({
    selector: 'app-dialog-box-high-scores',
    templateUrl: './dialog-box-high-scores.component.html',
    styleUrls: ['./dialog-box-high-scores.component.scss'],
})
export class DialogBoxHighScoresComponent implements OnInit {
    constructor(private highScoresService: HighScoresService) {}

    get highScoreClassic(): HighScores[] | undefined {
        return this.highScoresService.highScoreClassic;
    }

    get highScoreLOG29990(): HighScores[] | undefined {
        return this.highScoresService.highScoreLOG29990;
    }

    ngOnInit(): void {
        this.getHighScores();
    }

    getHighScores() {
        this.highScoresService.getHighScores();
    }
}
