import { Injectable } from '@angular/core';
import * as constants from '@app/constants/game';

const enum VirtualPlayer {
    Beginner = 'beginner',
    Expert = 'expert',
}

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayersService {
    beginnerBotNames: string[];
    expertBotNames: string[];
    botType: VirtualPlayer;
    constructor() {
        this.beginnerBotNames = constants.BOT_BEGINNER_NAME_LIST;
        this.expertBotNames = constants.BOT_EXPERT_NAME_LIST;
    }

    addBotName(newName: string, type: VirtualPlayer) {
        if (type === VirtualPlayer.Beginner) {
            this.beginnerBotNames.push(newName);
        } else {
            this.expertBotNames.push(newName);
        }
    }

    deleteBotName(toRemove: string, type: VirtualPlayer) {
        if (type === VirtualPlayer.Beginner) {
            this.beginnerBotNames.splice(this.beginnerBotNames.indexOf(toRemove), 1);
        } else {
            this.expertBotNames.splice(this.expertBotNames.indexOf(toRemove), 1);
        }
    }
}
