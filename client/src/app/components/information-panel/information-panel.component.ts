import { Component } from '@angular/core';
import { GameClientService } from '@app/services/game-client.service';

@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent {
    constructor(public gameClientService: GameClientService) {}
}
