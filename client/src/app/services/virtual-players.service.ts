import { Injectable } from '@angular/core';
import * as constants from '@app/constants/game';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayersService {
    beginnerBotNames: string[];
    expertBotNames: string[];
    constructor() {
        this.beginnerBotNames = constants.BOT_BEGINNER_NAME_LIST;
        this.expertBotNames = constants.BOT_EXPERT_NAME_LIST;
    }

    addBotName() {
        // check which list to add it in in order not to duplicate code between expert and beginner
        return null;
    }

    deleteBotName() {
        return null;
    }
}
