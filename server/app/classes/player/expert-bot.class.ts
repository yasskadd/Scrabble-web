import * as Constant from '@app/constants/bot';
import { SocketEvents } from '@common/constants/socket-events';
import { CommandInfo } from '@common/interfaces/command-info';
import { Bot } from './bot.class';

export class ExpertBot extends Bot {
    playTurn() {
        this.placeLetters();
    }

    play(commandInfo: CommandInfo) {
        if (commandInfo === undefined || this.playedTurned) {
            this.exchangeLetter();
            return;
        }
        this.emitPlaceCommand(commandInfo);
        this.playedTurned = true;
    }

    placeLetters() {
        const commandInfoMap = this.processWordSolver();
        const bestCommandInfo: CommandInfo = [...commandInfoMap.entries()].reduce((accumulator, currentScore) => {
            return currentScore[1] > accumulator[1] ? currentScore : accumulator;
        })[0];
        if (this.countUp >= 3 && this.countUp < Constant.TIME_SKIP) this.play(bestCommandInfo);
        else if (this.countUp < 3) setTimeout(() => this.play(bestCommandInfo), Constant.SECOND_3 - this.countUp * Constant.SECOND_1);
    }

    exchangeLetter() {
        if (this.game === undefined || this.playedTurned || this.game.letterReserve.totalQuantity()) return;
        let lettersLeftInReserve: number = this.game.letterReserve.totalQuantity();
        const rack: string[] = [...this.rackToString()];
        if (lettersLeftInReserve === 0) this.skipTurn();
        if (lettersLeftInReserve >= Constant.letterReserveMinQuantity) {
            this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, `!echanger ${rack.length} lettres`);
            this.game.exchange(rack, this);
        } else {
            const lettersToExchange: string[] = new Array();
            while (lettersLeftInReserve > 0) {
                lettersToExchange.push(rack.splice(this.getRandomNumber(rack.length) - 1, 1)[0]);
                lettersLeftInReserve--;
            }
            this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, `!echanger ${lettersToExchange.length} lettres`);
            this.rack = this.game.exchange(lettersToExchange, this);
        }
        this.playedTurned = true;
    }
}
