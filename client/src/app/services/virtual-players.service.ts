import { Injectable } from '@angular/core';
import * as constants from '@app/constants/game';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayersService {
    botNames: string[];
    constructor() {
        this.botNames = constants.BOT_NAME_LIST;
    }

    addBotName() {
        // check which list to add it in in order not to duplicate code between expert and beginner
        return null;
    }

    deleteBotName() {
        return null;
    }
}
