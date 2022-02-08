import { Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinate.class';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { GridService } from './grid.service';

type Timer = { minutes: number; seconds: number };
type Player = { username: string; score: number };

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

    constructor(private gridService: GridService, private clientSocketService: ClientSocketService) {
        // Used for testing
        // this.playerOneTurn = false;
        // setTimeout(this.stopTimer, 1000 * 5);
        this.clientSocketService.on(SocketEvents.UpdateGameBoard, (gameboard: Coordinate[]) => {
            this.updateGameboard(gameboard);
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
    updateGameboard(newGameboard: Coordinate[]) {
        this.gameboard = newGameboard;
        this.gridService.drawGridArray(this.gameboard);
    }
}
