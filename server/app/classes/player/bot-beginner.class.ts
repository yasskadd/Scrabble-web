import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Game } from '@app/services/game.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { SocketEvents } from '@common/socket-events';
import { Player } from './player.class';

const MAX_NUMBER = 10;
const CHAR_ASCII = 96;

export class BeginnerBot extends Player {
    game: Game;
    isPlayerOne: boolean;
    roomId: string;
    constructor(game: Game, isPlayerOne: boolean, name: string, private socketManager: SocketManager, roomId: string) {
        super(name);
        this.game = game;
        this.isPlayerOne = isPlayerOne;
        this.roomId = roomId;
    }

    choosePlayMove(commandInfoMap: Map<CommandInfo, number>) {
        const randomNumber = this.getRandomNumber(MAX_NUMBER);
        if (this.inRange(randomNumber, 1, 1) || !commandInfoMap.size) this.skipTurn();
        else if (this.inRange(randomNumber, 2, 2)) this.exchangeLetter();
        else this.placeLetter(commandInfoMap);
    }

    /* Take a random number of letters to exchange (between 1 and length of rack)
        and take random indexes from the player rack in order to exchange them, if there is not enough letter
        in the reserve, skipTurn() */
    exchangeLetter(): void {
        if (this.game === undefined) return;
        const rack: string[] = [...this.rackToString()];
        let numberOfLetters = this.getRandomNumber(rack.length);
        const lettersToExchange: string[] = new Array(numberOfLetters);
        while (numberOfLetters > 0) {
            lettersToExchange.push(rack.splice(this.getRandomNumber(rack.length), 1)[0]);
            numberOfLetters--;
        }
        this.socketManager.emitRoom(this.roomId, SocketEvents.GameMessage, `!echanger ${lettersToExchange} lettres`);
        this.rack = this.game.exchange(lettersToExchange, this);
    }

    skipTurn(): void {
        if (this.game === undefined) return;
        this.socketManager.emitRoom(this.roomId, SocketEvents.GameMessage, '!passer');
        this.game.skip(this.name);
    }

    /* What to do if there is no commandInfo associated with the score range */
    placeLetter(commandInfoMap: Map<CommandInfo, number>): [boolean, Gameboard] | string {
        if (this.game === undefined) return 'error';
        // find the commandInfo based on probability
        const randomNumber: number = this.getRandomNumber(MAX_NUMBER);
        const commandInfoList: CommandInfo[] = new Array();
        if (this.inRange(randomNumber, 1, 4)) {
            // maybe a better way to do this using spread operator with condition ?
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 1, 6)) commandInfoList.push(key);
            });
        } else if (this.inRange(randomNumber, 5, 7)) {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 7, 12)) commandInfoList.push(key);
            });
        } else {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 13, 18)) commandInfoList.push(key);
            });
        }
        // chose a random commandInfo
        const randomCommandInfo = commandInfoList[Math.floor(Math.random() * commandInfoList.length)];
        this.socketManager.emitRoom(
            this.roomId,
            SocketEvents.GameMessage,
            `!placer ${String.fromCharCode(CHAR_ASCII + randomCommandInfo.firstCoordinate.y)}${randomCommandInfo.firstCoordinate.x}${
                randomCommandInfo.direction
            } 
            ${randomCommandInfo.lettersPlaced}`,
        );
        return this.game.play(this, randomCommandInfo);
    }

    private getRandomNumber(maxNumber: number): number {
        return Math.floor(Math.random() * maxNumber + 1);
    }

    private inRange(x: number, start: number, end: number): boolean {
        return (x - start) * (x - end) <= 0;
    }
}
