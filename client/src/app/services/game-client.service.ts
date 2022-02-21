import { Injectable } from '@angular/core';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { GridService } from './grid.service';

type PlayInfo = { gameboard: LetterTile[]; activePlayer: string };
type Player = { name: string; score: number; rack?: Letter[]; room: string };
type GameInfo = { gameboard: LetterTile[]; players: Player[]; activePlayer: string };
@Injectable({
    providedIn: 'root',
})
export class GameClientService {
    static timerInterval: number;
    timer: number;
    gameboard: LetterTile[];
    playerOne: Player;
    secondPlayer: Player;
    playerOneTurn: boolean;
    letterReserveLength: number;
    isGameFinish: boolean;
    winningMessage: string;

    constructor(private gridService: GridService, private clientSocketService: ClientSocketService) {
        this.winningMessage = '';
        this.playerOneTurn = false;
        this.isGameFinish = false;
        this.configureBaseSocketFeatures();
    }
    configureBaseSocketFeatures() {
        this.clientSocketService.on(SocketEvents.UpdatePlayerInformation, (player: Player) => {
            this.playerOne = player;
            this.updateGameboard();
        });
        this.clientSocketService.on(SocketEvents.UpdateOpponentInformation, (player: Player) => {
            this.secondPlayer = player;
            this.updateGameboard();
        });

        this.clientSocketService.on(SocketEvents.LetterReserveUpdated, (letterReserveUpdated: Letter[]) => {
            this.letterReserveLength = this.getAllLetterReserve(letterReserveUpdated);
        });
        this.clientSocketService.on(SocketEvents.GameEnd, () => {
            if (this.winningMessage === '') {
                this.findWinnerByScore();
                this.isGameFinish = true;
            }
        });

        this.clientSocketService.on(SocketEvents.OpponentGameLeave, () => {
            this.playerOneTurn = false;
            this.isGameFinish = true;
            this.winningMessage = "Bravo vous avez gagné la partie, l'adversaire a quitté la partie";
        });
        this.clientSocketService.on(SocketEvents.ViewUpdate, (info: PlayInfo) => {
            this.playerOneTurn = info.activePlayer === this.playerOne.name;
            this.updateNewGameboard(info.gameboard);
        });

        this.clientSocketService.on(SocketEvents.Skip, (gameInfo: GameInfo) => {
            this.gameboard = gameInfo.gameboard;
            this.playerOne = this.playerOne.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
            this.secondPlayer = this.secondPlayer.name === gameInfo.players[0].name ? gameInfo.players[0] : gameInfo.players[1];
            this.playerOneTurn = gameInfo.activePlayer === this.playerOne.name;
            this.updateGameboard();
        });

        this.clientSocketService.on(SocketEvents.TimerClientUpdate, (newTimer: number) => {
            this.timer = newTimer;
        });
    }
    updateNewGameboard(newGameboard: LetterTile[]) {
        this.gameboard = newGameboard;
        this.updateGameboard();
    }
    updateGameboard() {
        this.gridService.drawGrid(this.gameboard);
        this.gridService.drawRack(this.playerOne.rack as Letter[]);
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
        this.playerOne = { name: '', score: 0, rack: [], room: '' };
        this.secondPlayer = { name: '', score: 0, rack: [], room: '' };
        this.playerOneTurn = false;
        this.letterReserveLength = 0;
        this.isGameFinish = false;
        this.winningMessage = '';
    }

    private findWinnerByScore(): void {
        if (this.playerOne.score === this.secondPlayer.score) {
            this.winningMessage = 'Bravo aux deux joueur, vous avez le même score';
        } else if (this.playerOne.score > this.secondPlayer.score) {
            this.winningMessage = 'Bravo Vous avez gagné la partie de Scrabble';
        } else {
            this.winningMessage = "L'adversaire a gagné la partie";
        }
    }
    private getAllLetterReserve(lettersReserveUpdated: Letter[]): number {
        let letterString = '';
        lettersReserveUpdated.forEach((letter) => {
            for (let i = 1; i <= letter.quantity; i++) {
                letterString = letterString + letter.value;
            }
        });
        return letterString.length;
    }
}
