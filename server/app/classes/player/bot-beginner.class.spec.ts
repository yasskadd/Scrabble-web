/* eslint-disable dot-notation */
import { Game } from '@app/services/game.service';
import { BeginnerBot } from './bot-beginner.class';

describe.only('BotBeginner', () => {
    let botBeginner: BeginnerBot;
    let gameStub: Game;
    beforeEach(() => {
        gameStub = {} as Game;
        botBeginner = new BeginnerBot(gameStub, true, 'robot');
    });

    it('getRandomNumber()', () => {
        for (let i = 0; i < 20; i++) {
            console.log(botBeginner['getRandomNumber']());
        }
    });
});
