import { Game } from '@app/classes/game';
import * as Constant from '@app/constants/bot';
import { BotInformation } from '@app/interfaces/bot-information';
import { CommandInfo } from '@app/interfaces/command-info';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { WordSolverService } from '@app/services/word-solver.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Container } from 'typedi';
import { Player } from './player.class';

export class BeginnerBot extends Player {
    isPlayerOne: boolean;
    roomId: string;
    game: Game;
    private wordSolver: WordSolverService = Container.get(WordSolverService);
    private socketManager: SocketManager = Container.get(SocketManager);
    private timer: number;
    private countUp: number = 0;
    private playedTurned: boolean = false;

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
            this.countUp = this.timer - (countdown as number);
            if (this.countUp === Constant.TIME_SKIP && this.name === this.game.turn.activePlayer) this.skipTurn();
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
        const randomNumber = this.getRandomNumber(Constant.MAX_NUMBER);
        if (randomNumber < 3) {
            setTimeout(() => {
                if (randomNumber === 1) this.skipTurn();
                else this.exchangeLetter();
            }, Constant.SECOND_3 - this.countUp * Constant.SECOND_1);
        } else this.placeLetter();
    }

    exchangeLetter(): void {
        if (this.game === undefined || this.playedTurned || this.game.letterReserve.totalQuantity() < Constant.letterReserveMinQuantity) return;
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

    placeLetter() {
        const commandInfoMap = this.processWordSolver();
        const commandInfoList = this.addCommandInfoToList(commandInfoMap, this.getRandomNumber(Constant.MAX_NUMBER));
        if (commandInfoList.length === 0) {
            setTimeout(() => this.skipTurn(), Constant.SECOND_3 - this.countUp * Constant.SECOND_1);
            return;
        }
        const randomCommandInfo = commandInfoList[Math.floor(Math.random() * commandInfoList.length)];
        if (this.countUp >= 3 && this.countUp < Constant.TIME_SKIP) this.play(randomCommandInfo);
        else if (this.countUp < 3) setTimeout(() => this.play(randomCommandInfo), Constant.SECOND_3 - this.countUp * Constant.SECOND_1);
    }

    private play(commandInfo: CommandInfo) {
        if (commandInfo === undefined || this.playedTurned) {
            this.skipTurn();
            return;
        }
        this.emitPlaceCommand(commandInfo);
        this.playedTurned = true;
    }

    private processWordSolver() {
        this.wordSolver.setGameboard(this.game.gameboard);
        return this.wordSolver.commandInfoScore(this.wordSolver.findAllOptions(this.rackToString()));
    }

    private addCommandInfoToList(commandInfoMap: Map<CommandInfo, number>, randomNumber: number): CommandInfo[] {
        const commandInfoList = new Array();
        if (this.inRange(randomNumber, 1, Constant.PROB_4)) {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, 1, Constant.RANGE_6)) commandInfoList.push(key);
            });
        } else if (this.inRange(randomNumber, Constant.PROB_5, Constant.PROB_7)) {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, Constant.RANGE_7, Constant.RANGE_12)) commandInfoList.push(key);
            });
        } else {
            commandInfoMap.forEach((value, key) => {
                if (this.inRange(value, Constant.RANGE_13, Constant.RANGE_18)) commandInfoList.push(key);
            });
        }
        return commandInfoList;
    }

    private emitPlaceCommand(randomCommandInfo: CommandInfo) {
        const coordString = `${String.fromCharCode(Constant.CHAR_ASCII + randomCommandInfo.firstCoordinate.y)}${randomCommandInfo.firstCoordinate.x}`;
        const placeCommand = `!placer ${coordString}${randomCommandInfo.isHorizontal ? 'h' : 'v'} ${randomCommandInfo.letters.join('')}`;
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.GameMessage, placeCommand);
        this.game.play(this, randomCommandInfo);
        this.socketManager.emitRoom(this.botInfo.roomId, SocketEvents.LetterReserveUpdated, this.game.letterReserve.lettersReserve);
    }

    private getRandomNumber(maxNumber: number): number {
        return Math.floor(Math.random() * maxNumber + 1);
    }

    private inRange(x: number, start: number, end: number): boolean {
        return (x - start) * (x - end) <= 0;
    }
}
