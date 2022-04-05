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

    get expertBots(): Bot[] {
        return this.virtualPlayerService.expertBotNames;
    }

    get beginnerBots(): Bot[] {
        return this.virtualPlayerService.beginnerBotNames;
    }
    isUniqueName(name: string) {
        if (this.virtualPlayerService.expertBotNames.some((bot) => bot.username.toLowerCase() === name.toLowerCase())) return false;
        if (this.virtualPlayerService.beginnerBotNames.some((bot) => bot.username.toLowerCase() === name.toLowerCase())) return false;
        return true;
    }

    addExpertName() {
        if (this.isUniqueName(this.expertInput)) {
            this.virtualPlayerService.addBotName(this.expertInput, VirtualPlayer.Expert);
        }
        this.expertInput = '';
    }

    addBeginnerName() {
        if (this.isUniqueName(this.beginnerInput)) {
            this.virtualPlayerService.addBotName(this.beginnerInput, VirtualPlayer.Beginner);
        }
        this.beginnerInput = '';
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
