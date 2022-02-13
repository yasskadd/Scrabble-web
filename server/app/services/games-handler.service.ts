import { Game } from '@app/classes/game';
import { Player } from '@app/classes/player';
import { Turn } from '@app/classes/turn';
// import { Coordinate } from '@common/coordinate';
import { SocketEvents } from '@common/socket-events';
import { Server, Socket } from 'socket.io';
import { Container, Service } from 'typedi';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';

// type PlayInfo = { gameboard: Coordinate[]; activePlayer: string | undefined };
interface GameHolder {
    game: Game | undefined;
    players: Player[];
    roomId: string;
}

interface GameScrabbleInformation {
    playerName: string[];
    roomId: string;
    timer: number;
    socketId: string[];
}

@Service()
export class GamesHandler {
    private players: Map<string, Player>;
    private games: Map<string, GameHolder>;

    constructor(private socketManager: SocketManager) {
        this.players = new Map();
        this.games = new Map();
    }
    initSocketsEvents(): void {
        this.socketManager.io(SocketEvents.CreateScrabbleGame, (sio, socket, gameInfo: GameScrabbleInformation) => {
            this.createGame(sio, socket, gameInfo);
        });

        // this.socketManager.io(SocketEvents.Play, (sio, socket /** commandInfo: PlacementCommandInfo*/) => {
        // this.playGame(sio, socket /** commandInfo */);
        // });

        this.socketManager.io(SocketEvents.Exchange, (sio, socket, letters: string[]) => {
            this.exchange(sio, socket, letters);
        });

        this.socketManager.on(SocketEvents.Skip, (socket) => {
            this.skip(socket);
        });
    }

    private skip(this: this, socket: Socket) {
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const gameHolder = this.games.get(room) as GameHolder;
        console.log('Skip boolean :');
        // DO NOT REMOVE the skip when removing the console.log (it must be called to skip)
        console.log(gameHolder.game?.skip(player.name));

        this.changeTurn(room);
    }

    private exchange(this: this, sio: Server, socket: Socket, letters: string[]) {
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const gameParam = this.games.get(room) as GameHolder;
        const game = gameParam.game as Game;
        const newRack = game.exchange(letters, player.name);
        player.rack = newRack;

        if (newRack.length === 0) return;
        socket.emit(SocketEvents.UpdatePlayerInformation, player);
        socket.broadcast.to(room).emit(SocketEvents.UpdateOpponentInformation, player);
        sio.to(room).emit(SocketEvents.Play, player, game.turn.activePlayer);
    }

    // private playGame(this: this, sio: Server, socket: Socket /** commandInfo: PlacementCommandInfo*/) {
    //     if (!this.players.has(socket.id)) return;
    //     const player = this.players.get(socket.id) as Player;

    //     const room = player.room;
    //     const gameParam = this.games.get(room) as GameHolder;

    //     const game = gameParam.game as Game;
    //     game.play(player.name, commandInfo);

    //     const playerInfo: PlayInfo = {
    //         gameboard: game.gameboard.gameboardCoords,
    //         activePlayer: game.turn.activePlayer,
    //     };

    //     sio.to(room).emit(SocketEvents.ViewUpdate, playerInfo);
    //     this.updatePlayerInfo(socket, room, game);
    // }

    private createGame(this: this, sio: Server, socket: Socket, gameInfo: GameScrabbleInformation) {
        const playerOne = this.setAndGetPlayer(gameInfo);
        const newGameHolder: GameHolder = { game: undefined, players: [playerOne], roomId: gameInfo.roomId };
        const playerTwo = this.setAndGetPlayer(gameInfo);

        newGameHolder.players.push(playerTwo);
        newGameHolder.game = this.createNewGame(newGameHolder);
        if (socket.id === gameInfo.socketId[0]) {
            this.updatePlayerInfo(socket, newGameHolder.roomId, newGameHolder.game);
        }
        newGameHolder.game.turn.endTurn.subscribe(() => {
            this.changeTurn(gameInfo.roomId);
        });
        newGameHolder.game.turn.countdown.subscribe((timer: number) => {
            this.sendTimer(gameInfo.roomId, timer);
        });
        sio.to(gameInfo.roomId).emit(SocketEvents.ViewUpdate, {
            gameboard: newGameHolder.game.gameboard.gameboardCoords,
            activePlayer: newGameHolder.game.turn.activePlayer,
        });

        console.log('START GAME : ');
        console.log(newGameHolder.game.turn.activePlayer);

        this.games.set(newGameHolder.roomId, newGameHolder);
    }

    private setAndGetPlayer(gameInfo: GameScrabbleInformation): Player {
        const player = this.players.has(gameInfo.socketId[0]) ? 1 : 0;
        const newPlayer = new Player(gameInfo.playerName[player]);

        newPlayer.room = gameInfo.roomId;
        this.players.set(gameInfo.socketId[player], newPlayer);
        return newPlayer;
    }

    private createNewGame(gameParam: GameHolder) {
        return new Game(gameParam.players[0], gameParam.players[1], new Turn(60), new LetterReserveService(), Container.get(LetterPlacementService));
    }

    private updatePlayerInfo(socket: Socket, roomId: string, game: Game) {
        socket.emit(SocketEvents.UpdatePlayerInformation, game.player1);
        socket.emit(SocketEvents.UpdateOpponentInformation, game.player2);
        socket.broadcast.to(roomId).emit(SocketEvents.UpdatePlayerInformation, game.player2);
        socket.broadcast.to(roomId).emit(SocketEvents.UpdateOpponentInformation, game.player1);
    }

    private changeTurn(roomId: string) {
        const game = this.games.get(roomId);
        const gameInfo = {
            gameboard: game?.game?.gameboard.gameboardCoords,
            players: game?.players,
            activePlayer: game?.game?.turn.activePlayer,
        };
        console.log('CHANGE TURN : ');
        console.log(gameInfo.activePlayer);
        this.socketManager.emitRoom(roomId, SocketEvents.Skip, gameInfo);
    }

    private sendTimer(roomId: string, timer: number) {
        this.socketManager.emitRoom(roomId, SocketEvents.TimerClientUpdate, timer);
    }
}
