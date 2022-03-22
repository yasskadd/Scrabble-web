import { Injectable } from '@angular/core';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { LetterTileInterface } from '@common/interfaces/letter-tile-interface';
import { ReplaySubject, Subject } from 'rxjs';
import { ClientSocketService } from './communication/client-socket.service';

type PlayInfo = { gameboard: LetterTileInterface[]; activePlayer: string };
type PlayerInformation = { name: string; score: number; rack: Letter[]; room: string; gameboard: LetterTileInterface[] };
type Player = { name: string; score: number; rack: Letter[] };
type GameInfo = { gameboard: LetterTileInterface[]; players: Player[]; activePlayer: string };
const TIMEOUT = 15;

@Injectable({
    providedIn: 'root',
})
export class GameClientService {
    timer: number;
    gameboard: LetterTileInterface[];
    playerOne: Player;
    secondPlayer: Player;
    playerOneTurn: boolean;
    letterReserveLength: number;
    isGameFinish: boolean;
    winningMessage: string;
    gameboardUpdated: Subject<boolean>;
    turnFinish: ReplaySubject<boolean>;

    constructor(private clientSocketService: ClientSocketService) {
        this.timer = 0;
        this.letterReserveLength = 0;
        this.playerOne = {} as Player;
        this.secondPlayer = {} as Player;
        this.winningMessage = '';
        this.playerOneTurn = false;
        this.isGameFinish = false;
        this.gameboardUpdated = new Subject();
        this.turnFinish = new ReplaySubject<boolean>(1);
        this.configureBaseSocketFeatures();
        this.gameboard = [];
    }

    configureBaseSocketFeatures() {
        this.clientSocketService.on(SocketEvents.UpdatePlayerInformation, (player: PlayerInformation) => {
            this.updatePlayerInformationEvent(player);
        });

        this.clientSocketService.on(SocketEvents.UpdateOpponentInformation, (player: Player) => {
            this.updateOpponentInformationEvent(player);
        });

        this.clientSocketService.on(SocketEvents.LetterReserveUpdated, (letterReserveUpdated: Letter[]) => {
            this.getAllLetterReserve(letterReserveUpdated);
        });

        this.clientSocketService.on(SocketEvents.GameEnd, () => {
            this.gameEndEvent();
        });

        this.clientSocketService.on(SocketEvents.OpponentGameLeave, () => {
            this.opponentLeaveGameEvent();
        });

        this.clientSocketService.on(SocketEvents.ViewUpdate, (info: PlayInfo) => {
            this.viewUpdateEvent(info);
        });

        this.clientSocketService.on(SocketEvents.Skip, (gameInfo: GameInfo) => {
            setTimeout(() => {
                this.skipEvent(gameInfo);
            }, TIMEOUT);
        });

        this.clientSocketService.on(SocketEvents.TimerClientUpdate, (newTimer: number) => {
            this.timerClientUpdateEvent(newTimer);
        });
    }
    updateGameboard() {
        this.gameboardUpdated.next(true);
    }

    abandonGame() {
        this.clientSocketService.send('AbandonGame');
        this.playerOneTurn = false;
    }

    quitGame() {
        this.clientSocketService.send('quitGame');
    }

    resetGameInformation() {
        this.timer = 0;
        this.gameboard = [];
        this.playerOne = { name: '', score: 0, rack: [] };
        this.secondPlayer = { name: '', score: 0, rack: [] };
        this.playerOneTurn = false;
        this.letterReserveLength = 0;
        this.isGameFinish = false;
        this.winningMessage = '';
    }

    private updateOpponentInformationEvent(player: Player) {
        this.secondPlayer = player;
    }

    private timerClientUpdateEvent(newTimer: number) {
        this.timer = newTimer;
        this.isTurnFinish(newTimer);
    }

    private isTurnFinish(newTimer: number): void {
        if (newTimer === 0 && this.playerOneTurn) {
            this.turnFinish.next(true);
            this.turnFinish.next(false);
        }
    }

    private viewUpdateEvent(info: PlayInfo) {
        this.playerOneTurn = info.activePlayer === this.playerOne.name;
        this.updateNewGameboard(info.gameboard);
    }

    private updatePlayerInformationEvent(player: PlayerInformation) {
        const updatedRack = this.updateRack(player.rack);
        this.playerOne = player;
        this.playerOne.rack = updatedRack;
        this.updateNewGameboard(player.gameboard);
    }

    private updateRack(newRack: Letter[]): Letter[] {
        const dictionary = new Map();
        newRack.forEach((letter) => {
            const dictionaryLetter = dictionary.get(letter.value);
            if (dictionaryLetter === undefined) dictionary.set(letter.value, { counter: 1, letter });
            else dictionaryLetter.counter++;
        });
        const resultingRack = [] as Letter[];
        this.playerOne.rack.forEach((letter) => {
            const dictionaryLetter = dictionary.get(letter.value);
            if (dictionaryLetter !== undefined && dictionaryLetter.counter > 0) {
                resultingRack.push(letter);
                dictionaryLetter.counter--;
            }
        });
        dictionary.forEach((dictionaryLetter) => {
            while (dictionaryLetter.counter > 0) {
                resultingRack.push(dictionaryLetter.letter);
                dictionaryLetter.counter--;
            }
        });
        return resultingRack;
    }

    private updateNewGameboard(newGameboard: LetterTileInterface[]) {
        this.gameboard = newGameboard;
        this.updateGameboard();
    }

    private gameEndEvent() {
        if (this.winningMessage === '') {
            this.findWinnerByScore();
            this.isGameFinish = true;
        }
    }

    private opponentLeaveGameEvent() {
        this.playerOneTurn = false;
        this.isGameFinish = true;
        this.winningMessage = "Bravo vous avez gagné la partie, l'adversaire a quitté la partie";
    }

    private skipEvent(gameInfo: GameInfo) {
        this.gameboard = gameInfo.gameboard;
        const playerOneIndex = this.playerOne.name === gameInfo.players[0].name ? 0 : 1;
        const secondPlayerIndex = Math.abs(playerOneIndex - 1);
        const updatedRack = this.updateRack(gameInfo.players[playerOneIndex].rack);
        this.playerOne = gameInfo.players[playerOneIndex];
        this.playerOne.rack = updatedRack;
        this.secondPlayer = gameInfo.players[secondPlayerIndex];
        this.playerOneTurn = gameInfo.activePlayer === this.playerOne.name;
        this.updateGameboard();
    }

    private findWinnerByScore(): void {
        if (this.playerOne.score === this.secondPlayer.score) {
            this.winningMessage = 'Bravo aux deux joueur, vous avez le même score';
            return;
        }
        if (this.playerOne.score > this.secondPlayer.score) {
            this.winningMessage = `Bravo ${this.playerOne.name} vous avez gagné`;
            return;
        }
        this.winningMessage = `Bravo ${this.secondPlayer.name} vous avez gagné`;
    }
    private getAllLetterReserve(lettersReserveUpdated: Letter[]): void {
        let letterString = '';
        lettersReserveUpdated.forEach((letter) => {
            for (let i = 1; i <= letter.quantity; i++) {
                letterString = letterString + letter.value;
            }
        });
        this.letterReserveLength = letterString.length;
    }
}
