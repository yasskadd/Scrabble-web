import { Component, OnInit } from '@angular/core';
import { GameClientService } from '@app/services/game-client.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(private gameClientService: GameClientService) {}

    ngOnInit(): void {
        this.gameClientService.resetGameInformation();
    }
}
