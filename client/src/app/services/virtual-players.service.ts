import { Injectable } from '@angular/core';
import * as constants from '@app/constants/game';
import { Bot } from '@app/interfaces/bot';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';

export enum VirtualPlayer {
    Beginner = 'beginner',
    Expert = 'expert',
}

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayersService {
    beginnerBotNames: Bot[];
    expertBotNames: string[];
    botType: VirtualPlayer;
    constructor(private readonly httpHandler: HttpHandlerService) {}

    addBotName(newName: string, type: VirtualPlayer) {
        if (type === VirtualPlayer.Beginner) {
            //   this.beginnerBotNames.push(newName);
        } else {
            this.expertBotNames.push(newName);
        }
    }

    deleteBotName(toRemove: string, type: VirtualPlayer) {
        if (type === VirtualPlayer.Beginner) {
            //  this.beginnerBotNames.splice(this.beginnerBotNames.indexOf(toRemove), 1);
        } else {
            this.expertBotNames.splice(this.expertBotNames.indexOf(toRemove), 1);
        }
    }

    resetBotNames() {
        this.beginnerBotNames.splice(0, this.beginnerBotNames.length);
        this.expertBotNames.splice(0, this.expertBotNames.length);
    }

    getBotNames() {
        this.httpHandler.getBeginnerBots().subscribe((beginnerBot) => {
            this.beginnerBotNames = beginnerBot;
        });
        this.expertBotNames = constants.BOT_EXPERT_NAME_LIST;
    }
}
