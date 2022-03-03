import { CommandInfo } from '@app/command-info';
import { Game } from '@app/services/game.service';
import { Player } from './player.class';

export class BeginnerBot extends Player {
    game: Game;
    isPlayerOne: boolean;

    constructor(game: Game, isPlayerOne: boolean, name: string) {
        super(name);
        this.game = game;
        this.isPlayerOne = isPlayerOne;
    }

    /* Take a random number of letters to exchange (between 1 and length of rack)
        and take random indexes from the player rack in order to exchange them */
    exchangeLetter(letters: string[]) {
        if (this.game === undefined) return;
        const rack: string[] = [...this.rack];
        const numberOfLetters = this.getRandomNumber(rack.length);
        this.rack = this.game.exchange(letters, this);
    }
    skipTurn() {
        if (this.game === undefined) return;
        this.game.skip(this.name);
    }

    placeLetter(commandInfoMap: Map<CommandInfo, number>): [boolean, Gameboard] | string {
        if (this.game === undefined) return 'error';
        // find the commandInfo based on probability
        const randomNumber: number = this.getRandomNumber();
        const commandInfoList: CommandInfo[] = new Array();
        if (this.inRange(randomNumber, 1, 4)) {
            // maybe a better way to do this using spread operator with condition ?
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 1, 4)) commandInfoList.push(key);
            });
        } else if (this.inRange(randomNumber, 5, 7)) {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 5, 7)) commandInfoList.push(key);
            });
        } else {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 8, 10)) commandInfoList.push(key);
            });
        }
        // chose a random commandInfo
        const randomCommandInfo = commandInfoList[Math.random() * commandInfoList.length];
        return this.game.play(this, randomCommandInfo);
    }

    private getRandomNumber(maxNumber: number) {
        return Math.floor(Math.random() * maxNumber + 1);
    }

    private inRange(x: number, start: number, end: number) {
        return (x - start) * (x - end) <= 0;
    }
}
