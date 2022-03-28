import { Component } from '@angular/core';
import { VirtualPlayersService } from '@app/services/virtual-players.service';

@Component({
    selector: 'app-admin-virtual-players',
    templateUrl: './admin-virtual-players.component.html',
    styleUrls: ['./admin-virtual-players.component.scss'],
})
export class AdminVirtualPlayersComponent {
    constructor(public virtualPlayerService: VirtualPlayersService) {}

    get botNames(): string[] {
        return this.virtualPlayerService.botNames;
    }
}
