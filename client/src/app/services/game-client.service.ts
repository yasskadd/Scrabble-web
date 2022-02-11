import { Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinate.class';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { GridService } from './grid.service';

type PlayInfo = { gameboard: Coordinate[]; activePlayer: string };
type Timer = { minutes: number; seconds: number };
type Player = { name: string; score: number; rack?: Letter[]; room: string };
type GameInfo = { gameboard: Coordinate[]; players: Player[]; activePlayer: string };
@Injectable({
    providedIn: 'root',
})
export class GameClientService {
    static timerInterval: number;
    gameTimer: Timer;
    gameboard: Coordinate[];
    playerOne: Player;
    secondPlayer: Player;
    playerOneTurn: boolean;
    letterReserve: Letter[];

    constructor(private gridService: GridService, private clientSocketService: ClientSocketService) {
        // Used for testing
        this.playerOneTurn = false;
        // setTimeout(this.stopTimer, 1000 * 5)
        this.configureBaseSocketFeatures();
    }
    configureBaseSocketFeatures() {
        this.clientSocketService.on('UpdateMyPlayerInformation', (player: Player) => {
            console.log(player);
            this.playerOne = player;
        });
        this.clientSocketService.on('UpdateOpponentInformation', (player: Player) => {
            console.log(player);
            this.secondPlayer = player;
        });
        this.clientSocketService.on(SocketEvents.ViewUpdate, (info: PlayInfo) => {
            console.log(info.gameboard);
            console.log(info.activePlayer);
            this.playerOneTurn = info.activePlayer === this.playerOne.name;
            this.updateNewGameboard(info.gameboard);
        });
        this.clientSocketService.on(SocketEvents.Skip, (gameInfo: GameInfo) => {
            this.gameboard = gameInfo.gameboard;
            this.playerOne = this.playerOne.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
            this.secondPlayer = this.secondPlayer.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
            this.playerOneTurn = gameInfo.activePlayer === this.playerOne.name;
        });
    }

    startTimer(timer: Timer) {
        const timeOut = 1000;
        this.gameTimer = timer;
        GameClientService.timerInterval = setInterval(() => {
            if (this.gameTimer.seconds === 0) {
                this.gameTimer.minutes--;
                this.gameTimer.seconds = 60;
            } else this.gameTimer.seconds--;
        }, timeOut) as unknown as number;
    }
    stopTimer() {
        clearInterval(GameClientService.timerInterval as number);
    }
    updateNewGameboard(newGameboard: Coordinate[]) {
        this.gameboard = newGameboard;
        this.updateGameboard();
    }
    updateGameboard() {
        this.gridService.drawGridArray(this.gameboard);
    }
}
