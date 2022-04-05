import { Injectable } from '@angular/core';
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
    expertBotNames: Bot[];
    botType: VirtualPlayer;
    constructor(private readonly httpHandler: HttpHandlerService) {}

    addBotName(newName: string, type: VirtualPlayer) {
        this.httpHandler
            .addBot({ username: newName, difficulty: type === VirtualPlayer.Beginner ? 'debutant' : 'Expert' })
            .toPromise()
            .then(() => this.getBotNames());
    }

    deleteBotName(toRemove: string, type: VirtualPlayer) {
        this.httpHandler.deleteBot({ username: toRemove, difficulty: type === VirtualPlayer.Beginner ? 'debutant' : 'Expert' }).subscribe();
    }

    resetBotNames() {
        this.httpHandler
            .resetBot()
            .toPromise()
            .then(() => this.getBotNames());
    }

    getBotNames() {
        this.httpHandler.getBeginnerBots().subscribe((beginnerBot) => {
            this.beginnerBotNames = beginnerBot;
        });
        this.httpHandler.getExpertBots().subscribe((expertBot) => {
            this.expertBotNames = expertBot;
        });
    }
}
