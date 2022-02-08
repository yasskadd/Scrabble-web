import { Component, OnInit } from '@angular/core';
import { GameClientService } from '@app/services/game-client.service';

@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent implements OnInit {
    constructor(public gameClientService: GameClientService) {}

    ngOnInit(): void {
        this.gameClientService.startTimer({ minutes: 1, seconds: 0 });
    }
}
