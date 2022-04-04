import { Component, OnInit } from '@angular/core';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { GameHistoryInfo } from '@common/interfaces/game-history-info';

@Component({
    selector: 'app-games-history',
    templateUrl: './games-history.component.html',
    styleUrls: ['./games-history.component.scss'],
})
export class GamesHistoryComponent implements OnInit {
    gamesHistory: GameHistoryInfo[];
    constructor(private readonly httpHandler: HttpHandlerService) {}

    ngOnInit(): void {
        this.getHistory();
    }

    deleteHistory() {
        this.httpHandler
            .deleteHistory()
            .toPromise()
            .then(() => this.getHistory());
    }

    getHistory() {
        this.httpHandler.getHistory().subscribe((games) => (this.gamesHistory = games));
    }
}
