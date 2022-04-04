import { Component } from '@angular/core';
import { Bot } from '@app/interfaces/bot';
import { VirtualPlayer, VirtualPlayersService } from '@app/services/virtual-players.service';

@Component({
    selector: 'app-admin-virtual-players',
    templateUrl: './admin-virtual-players.component.html',
    styleUrls: ['./admin-virtual-players.component.scss'],
})
export class AdminVirtualPlayersComponent {
    expertInput: string;
    beginnerInput: string;
    playerType: VirtualPlayer;
    constructor(public virtualPlayerService: VirtualPlayersService) {
        this.expertInput = '';
        this.beginnerInput = '';
    }

    get expertBots(): string[] {
        return this.virtualPlayerService.expertBotNames;
    }

    get beginnerBots(): Bot[] {
        if (this.virtualPlayerService.beginnerBotNames === undefined) this.virtualPlayerService.getBotNames();
        return this.virtualPlayerService.beginnerBotNames;
    }
    isUniqueName(name: string) {
        // return !this.virtualPlayerService.expertBotNames.includes(name) && !this.virtualPlayerService.beginnerBotNames.includes(name);
        console.log(name);
        return true;
    }

    addExpertName() {
        if (this.isUniqueName(this.expertInput)) {
            this.virtualPlayerService.addBotName(this.expertInput, VirtualPlayer.Expert);
        }
    }

    addBeginnerName() {
        if (this.isUniqueName(this.beginnerInput)) {
            this.virtualPlayerService.addBotName(this.beginnerInput, VirtualPlayer.Beginner);
        }
    }

    addName() {
        // if (this.playerType === VirtualPlayer.Beginner) {
        //     this.virtualPlayerService.addBotName(this.beginnerInput, this.playerType);
        // }
        // if (this.playerType === VirtualPlayer.Expert) {
        //     this.virtualPlayerService.addBotName(this.expertInput, this.playerType);
        // }
        console.log('helloooo');
    }
}
