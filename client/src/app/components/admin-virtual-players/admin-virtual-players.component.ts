import { Component, OnInit } from '@angular/core';
import { VirtualPlayersService } from '@app/services/virtual-players.service';

@Component({
    selector: 'app-admin-virtual-players',
    templateUrl: './admin-virtual-players.component.html',
    styleUrls: ['./admin-virtual-players.component.scss'],
})
export class AdminVirtualPlayersComponent implements OnInit {
    constructor(public virtualPlayerService: VirtualPlayersService) {}

    get expertBots(): string[] {
        return this.virtualPlayerService.expertBotNames;
    }

    get beginnerBots(): string[] {
        return this.virtualPlayerService.beginnerBotNames;
    }

    ngOnInit(): void {}

    addName() {
        // this.virtualPlayerService.addBotName('random', 'beginner');
    }
}
