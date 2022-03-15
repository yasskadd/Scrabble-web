import { CommandInfo } from '@app/interfaces/command-info';
import { Game } from '@app/services/game.service';
import { SocketManager } from '@app/services/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Container } from 'typedi';
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
const SECOND_3 = 3000;
const SECOND_1 = 1000;

export interface BotInformation {
    timer: number;
    roomId: string;
}

export class BeginnerBot extends Player {
    isPlayerOne: boolean;
    roomId: string;
    game: Game;
    private wordSolver: WordSolverService = Container.get(WordSolverService);
    private socketManager: SocketManager = Container.get(SocketManager);
    private timer: number;
    private countUp: number;
    private playedTurned: boolean;

    constructor(isPlayerOne: boolean, name: string, private botInfo: BotInformation) {
        super(name);
        this.isPlayerOne = isPlayerOne;
        this.room = botInfo.roomId;
        this.timer = botInfo.timer;
        this.playedTurned = false;
        this.countUp = 0;
    }

    setGame(game: Game) {
        this.game = game;
        if (game.turn.activePlayer === this.name) this.choosePlayMove();
    }

    start() {
        this.game.turn.countdown.subscribe((countdown) => {
            this.countUp = this.timer - (countdown as number);
            if (this.countUp === TIME_SKIP && this.name === this.game.turn.activePlayer) this.skipTurn();
        });
        this.game.turn.endTurn.subscribe((activePlayer) => {
            this.playedTurned = false;
            if (activePlayer === this.name) {
                this.countUp = 0;
                this.choosePlayMove();
            }
        });
    }

    choosePlayMove() {
        const randomNumber = this.getRandomNumber(MAX_NUMBER);
        if (randomNumber < 3) {
            setTimeout(() => {
                if (randomNumber === 1) this.skipTurn();
                else this.exchangeLetter();
            }, SECOND_3 - this.countUp * SECOND_1);
            return;
        }
        this.placeLetter();
    }

    exchangeLetter(): void {
        if (this.game === undefined || this.playedTurned) return;
        const rack: string[] = [...this.rackToString()];
        let numberOfLetters = this.getRandomNumber(rack.length);
        const lettersToExchange: string[] = new Array();
        while (numberOfLetters > 0) {
            lettersToExchange.push(rack.splice(this.getRandomNumber(rack.length) - 1, 1)[0]);
            numberOfLetters--;
        }
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, `!echanger ${lettersToExchange.length} lettres`);
        this.rack = this.game.exchange(lettersToExchange, this);
        this.playedTurned = true;
    }

    skipTurn(): void {
        if (this.game === undefined || this.playedTurned) return;
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, '!passer');
        this.game.skip(this.name);
        this.playedTurned = true;
    }

    // TODO : maybe make a function for waiting till 3 seconds?
    placeLetter() {
        const commandInfoMap = this.processWordSolver();
        const commandInfoList = this.addCommandInfoToList(commandInfoMap, this.getRandomNumber(MAX_NUMBER));
        if (commandInfoList.length === 0) {
            setTimeout(() => this.skipTurn(), SECOND_3 - this.countUp * SECOND_1);
            return;
        }
        const randomCommandInfo = commandInfoList[Math.floor(Math.random() * commandInfoList.length)];
        if (this.countUp >= 3 && this.countUp < TIME_SKIP) this.play(randomCommandInfo);
        else if (this.countUp < 3) setTimeout(() => this.play(randomCommandInfo), SECOND_3 - this.countUp * SECOND_1);
    }

    private play(commandInfo: CommandInfo) {
        if (commandInfo === undefined || this.playedTurned) {
            this.skipTurn();
            return;
        }
        this.emitPlaceCommand(commandInfo);
        this.game.play(this, commandInfo);
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.LetterReserveUpdated, this.game.letterReserve.lettersReserve);
        this.playedTurned = true;
    }

    private processWordSolver() {
        this.wordSolver.setGameboard(this.game.gameboard);
        return this.wordSolver.commandInfoScore(this.wordSolver.findAllOptions(this.rackToString()));
    }

    private addCommandInfoToList(commandInfoMap: Map<CommandInfo, number>, randomNumber: number): CommandInfo[] {
        const commandInfoList = new Array();
        if (this.inRange(randomNumber, 1, PROB_4)) {
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
        const placeCommand = `!placer ${coordString}${randomCommandInfo.direction} ${randomCommandInfo.lettersPlaced.join('')}`;
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, placeCommand);
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.LetterReserveUpdated, this.game.letterReserve.lettersReserve);
        this.game.play(this, randomCommandInfo);
    }

    private getRandomNumber(maxNumber: number): number {
        return Math.floor(Math.random() * maxNumber + 1);
    }

    private inRange(x: number, start: number, end: number): boolean {
        return (x - start) * (x - end) <= 0;
    }
}
