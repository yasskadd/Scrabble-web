import { CommandInfo } from '@app/interfaces/command-info';
import { Game } from '@app/services/game.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Inject } from 'typedi';
import { Player } from './player.class';

const MAX_NUMBER = 10;
const CHAR_ASCII = 96;
const RANGE_6 = 6;
const RANGE_7 = 7;
const RANGE_12 = 12;
const RANGE_13 = 13;
const RANGE_18 = 18;
const PROB_4 = 4;
const PROB_5 = 5;
const PROB_7 = 7;
const TIME_SKIP = 20;

export interface BotInformation {
    timer: number;
    roomId: string;
}

export class BeginnerBot extends Player {
    @Inject() private wordSolver: WordSolverService;
    @Inject() private socketManager: SocketManager;
    isPlayerOne: boolean;
    roomId: string;
    game: Game;
    private timer: number;
    private countup: number;

    constructor(isPlayerOne: boolean, name: string, private botInfo: BotInformation) {
        super(name);
        this.isPlayerOne = isPlayerOne;
        this.room = botInfo.roomId;
        this.timer = botInfo.timer;
    }

    setGame(game: Game) {
        this.game = game;
        if (game.turn.activePlayer === this.name) this.choosePlayMove();
    }

    start() {
        this.game.turn.countdown.subscribe((countdown) => {
            this.countup = this.timer - (countdown as number);
        });
        this.game.turn.endTurn.subscribe((activePlayer) => {
            if (activePlayer === this.name) this.choosePlayMove();
        });
    }

    choosePlayMove() {
        const randomNumber = this.getRandomNumber(MAX_NUMBER);
        if (randomNumber === 1) this.skipTurn();
        else if (randomNumber === 2) this.exchangeLetter();
        else this.placeLetter();
    }

    /* Take a random number of letters to exchange (between 1 and length of rack)
        and take random indexes from the player rack in order to exchange them, if there is not enough letter
        in the reserve, skipTurn() */
    exchangeLetter(): void {
        if (this.game === undefined) return;
        const rack: string[] = [...this.rackToString()];
        let numberOfLetters = this.getRandomNumber(rack.length);
        const lettersToExchange: string[] = new Array();
        while (numberOfLetters > 0) {
            lettersToExchange.push(rack.splice(this.getRandomNumber(rack.length) - 1, 1)[0]);
            numberOfLetters--;
        }
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, `!echanger ${lettersToExchange.length} lettres`);
        this.rack = this.game.exchange(lettersToExchange, this);
    }

    skipTurn(): void {
        if (this.game === undefined) return;
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, '!passer');
        this.game.skip(this.name);
    }

    /* What to do if there is no commandInfo associated with the score range */
    async placeLetter() {
        const commandInfoMap = await this.processWordSolver();
        if (!commandInfoMap.size) this.skipTurn();
        const commandInfoList: CommandInfo[] = new Array();
        this.addCommandInfoToList(commandInfoMap, commandInfoList, this.getRandomNumber(MAX_NUMBER));
        const randomCommandInfo = commandInfoList[Math.floor(Math.random() * commandInfoList.length)];
        if (this.countup >= 3 && this.countup <= TIME_SKIP) {
            this.emitPlaceCommand(randomCommandInfo);
            this.game.play(this, randomCommandInfo);
            return;
        }
        if (this.countup < 3) {
            setTimeout(() => {
                this.emitPlaceCommand(randomCommandInfo);
                this.game.play(this, randomCommandInfo);
            }, 3 - this.countup);
            return;
        }
        this.skipTurn();
    }

    private async processWordSolver() {
        return new Promise<Map<CommandInfo, number>>((resolve) => {
            resolve(this.wordSolver.commandInfoScore(this.wordSolver.findAllOptions(this.rackToString())));
        });
    }

    private addCommandInfoToList(commandInfoMap: Map<CommandInfo, number>, commandInfoList: CommandInfo[], randomNumber: number) {
        if (this.inRange(randomNumber, 1, PROB_4)) {
            // maybe a better way to do this using spread operator with condition ?
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 1, RANGE_6)) commandInfoList.push(key);
            });
        } else if (this.inRange(randomNumber, PROB_5, PROB_7)) {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, RANGE_7, RANGE_12)) commandInfoList.push(key);
            });
        } else {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, RANGE_13, RANGE_18)) commandInfoList.push(key);
            });
        }
        return commandInfoList;
    }

    private emitPlaceCommand(randomCommandInfo: CommandInfo) {
        const coordString = `${String.fromCharCode(CHAR_ASCII + randomCommandInfo.firstCoordinate.y)}${randomCommandInfo.firstCoordinate.x}`;
        const placeCommand = `${coordString}${randomCommandInfo.direction} ${randomCommandInfo.lettersPlaced.join('')}`;
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, placeCommand);
    }

    private getRandomNumber(maxNumber: number): number {
        return Math.floor(Math.random() * maxNumber + 1);
    }

    private inRange(x: number, start: number, end: number): boolean {
        return (x - start) * (x - end) <= 0;
    }
}
