import { Injectable } from '@angular/core';
import { LetterTile } from '@common/letter-tile.class';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { GridService } from './grid.service';
import { LetterTilesService } from './letter-tiles.service';

type PlayInfo = { gameboard: LetterTile[]; activePlayer: string };
type Player = { name: string; score: number; rack?: LetterTile[]; room: string };
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
    etterTileReserve: LetterTile[];

    constructor(private gridService: GridService, private letterTilesService: LetterTilesService, private clientSocketService: ClientSocketService) {
        // Used for testing
        this.playerOneTurn = false;
        // setTimeout(this.stopTimer, 1000 * 5)
        this.configureBaseSocketFeatures();
    }
    configureBaseSocketFeatures() {
        this.clientSocketService.on(SocketEvents.UpdatePlayerInformation, (player: Player) => {
            console.log(player);
            this.playerOne = player;
            this.updateGameboard();
        });
        this.clientSocketService.on(SocketEvents.UpdateOpponentInformation, (player: Player) => {
            console.log(player);
            this.secondPlayer = player;
            this.updateGameboard();
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
        this.letterTilesService.drawRack(this.playerOne.rack as Letter[]);
    }
}
