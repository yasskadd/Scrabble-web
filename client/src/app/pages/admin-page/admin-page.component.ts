import { Component, OnInit } from '@angular/core';
import { VirtualPlayersService } from '@app/services/virtual-players.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    constructor(public virtualPlayers: VirtualPlayersService) {
        this.virtualPlayers.getBotNames();
    }

    ngOnInit(): void {}
}
