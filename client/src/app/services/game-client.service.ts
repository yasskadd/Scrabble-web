import { Injectable } from '@angular/core';
import { LetterTile } from '@common/classes/letter-tile.class';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { ReplaySubject, Subject } from 'rxjs';
import { ClientSocketService } from './client-socket.service';

type PlayInfo = { gameboard: LetterTile[]; activePlayer: string };
type PlayerInformation = { name: string; score: number; rack: Letter[]; room: string; gameboard: LetterTile[] };
type Player = { name: string; score: number; rack: Letter[] };
type GameInfo = { gameboard: LetterTile[]; players: Player[]; activePlayer: string };
const TIMEOUT = 15;

@Injectable({
    providedIn: 'root',
})
export class GameClientService {
    timer: number;
    gameboard: LetterTile[];
    playerOne: Player;
    secondPlayer: Player;
    playerOneTurn: boolean;
    letterReserveLength: number;
    isGameFinish: boolean;
    winningMessage: string;
    gameboardUpdated: Subject<boolean>;
    turnFinish: ReplaySubject<boolean>;

    constructor(private clientSocketService: ClientSocketService) {
        this.winningMessage = '';
        this.playerOneTurn = false;
        this.isGameFinish = false;
        this.gameboardUpdated = new Subject();
        this.turnFinish = new ReplaySubject<boolean>(1);
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.clientSocketService.on(SocketEvents.UpdatePlayerInformation, (player: PlayerInformation) => {
            this.updatePlayerInformationEvent(player);
        });

        this.clientSocketService.on(SocketEvents.UpdateOpponentInformation, (player: Player) => {
            this.secondPlayer = player;
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
        this.playerOne = player;
        this.updateNewGameboard(player.gameboard);
    }

    private updateNewGameboard(newGameboard: LetterTile[]) {
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
        this.playerOne = this.playerOne.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
        this.secondPlayer = this.secondPlayer.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
        this.playerOneTurn = gameInfo.activePlayer === this.playerOne.name;
        this.updateGameboard();
    }

    private findWinnerByScore(): void {
        if (this.playerOne.score === this.secondPlayer.score) {
            this.winningMessage = 'Bravo aux deux joueur, vous avez le même score';
        } else if (this.playerOne.score > this.secondPlayer.score) {
            this.winningMessage = `Bravo ${this.playerOne.name} vous avez gagné`;
        } else {
            this.winningMessage = `Bravo ${this.secondPlayer.name} vous avez gagné`;
        }
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
