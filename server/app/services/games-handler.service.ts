import { Game } from '@app/classes/game';
import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/command-info';
import { LetterTile } from '@common/letter-tile.class';
import { SocketEvents } from '@common/socket-events';
import { Server, Socket } from 'socket.io';
import { Container, Service } from 'typedi';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';

const SECOND = 1000;
type PlayInfo = { gameboard: LetterTile[]; activePlayer: string | undefined };
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
        //
        this.socketManager.io(SocketEvents.CreateScrabbleGame, (sio, socket, gameInfo: GameScrabbleInformation) =>
            this.createGame(sio, socket, gameInfo),
        );

        this.socketManager.io(SocketEvents.Play, (sio, socket, commandInfo: CommandInfo) => {
            this.playGame(sio, socket, commandInfo);
        });

        this.socketManager.io(SocketEvents.Exchange, (sio, socket, letters: string[]) => {
            this.exchange(sio, socket, letters);
        });
        //
        this.socketManager.on(SocketEvents.Skip, (socket) => {
            this.skip(socket);
        });
        //
        this.socketManager.on(SocketEvents.Disconnect, (socket) => {
            this.disconnect(socket);
        });
        //
        this.socketManager.on(SocketEvents.AbandonGame, (socket) => {
            this.abandonGame(socket);
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
        socket.broadcast.to(room).emit(SocketEvents.GameMessage, '!passer');
        this.changeTurn(room);
    }

    private exchange(this: this, sio: Server, socket: Socket, letters: string[]) {
        if (!this.players.has(socket.id)) return;
        const lettersToExchange = letters.length;
        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const playerRack = player.rack;
        const gameParam = this.games.get(room) as GameHolder;
        const game = gameParam.game as Game;
        const newRack = game.exchange(letters, player.name);
        player.rack = newRack;
        if (newRack.length === 0) return;
        if (JSON.stringify(playerRack) === JSON.stringify(player.rack)) {
            socket.emit('impossibleCommandError', 'Vous ne posséder pas toutes les lettres a échanger');
        } else {
            socket.broadcast.to(player.room).emit(SocketEvents.GameMessage, `!echanger ${lettersToExchange} lettres`);
        }
        this.updatePlayerInfo(socket, room, game);
        sio.to(room).emit(SocketEvents.Play, player, game.turn.activePlayer);
    }

    private playGame(this: this, sio: Server, socket: Socket, commandInfo: CommandInfo) {
        if (!this.players.has(socket.id)) return;
        const firstCoordinateColumns = commandInfo.firstCoordinate.x;
        const firstCoordinateRows = commandInfo.firstCoordinate.y;
        const letterPlaced = commandInfo.lettersPlaced.join('');
        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const gameParam = this.games.get(room) as GameHolder;
        const game = gameParam.game as Game;
        const play = game.play(player.name, commandInfo) as [boolean, Gameboard] | string;

        if (typeof play[0] === 'string') {
            socket.emit(SocketEvents.ImpossibleCommandError, play);
        } else if (typeof play !== 'string') {
            const playerInfo: PlayInfo = {
                gameboard: play[1].gameboardCoords,
                activePlayer: game.turn.activePlayer,
            };
            sio.to(room).emit(SocketEvents.ViewUpdate, playerInfo);
            this.updatePlayerInfo(socket, room, game);
            if (!play[0]) {
                socket.emit('impossibleCommandError', 'Les lettres que vous essayer de mettre ne forme pas des mots valides');
            } else {
                const charASCII = 96;
                socket.broadcast
                    .to(player.room)
                    .emit(
                        SocketEvents.GameMessage,
                        `!placer ${String.fromCharCode(charASCII + firstCoordinateRows)}${firstCoordinateColumns}${
                            commandInfo.direction
                        } ${letterPlaced}`,
                    );
            }
        }
    }

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
            console.log('SUBSCRIBE 1');
            this.changeTurn(gameInfo.roomId);
        });
        newGameHolder.game.turn.countdown.subscribe((timer: number) => {
            console.log('SUBSCRIBE 2');
            this.sendTimer(gameInfo.roomId, timer);
        });
        sio.to(gameInfo.roomId).emit(SocketEvents.ViewUpdate, {
            gameboard: newGameHolder.game.gameboard.gameboardCoords,
            activePlayer: newGameHolder.game.turn.activePlayer,
        });
        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.LetterReserveUpdated, newGameHolder.game.letterReserve.lettersReserve);
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
        const oneMinute = 60;
        return new Game(
            gameParam.players[0],
            gameParam.players[1],
            new Turn(oneMinute),
            new LetterReserveService(),
            Container.get(LetterPlacementService),
        );
    }

    private updatePlayerInfo(socket: Socket, roomId: string, game: Game) {
        const player = this.players.get(socket.id) as Player;
        if (player.name === game.player1.name) {
            socket.emit(SocketEvents.UpdatePlayerInformation, game.player1);
            socket.emit(SocketEvents.UpdateOpponentInformation, game.player2);
            socket.broadcast.to(roomId).emit(SocketEvents.UpdatePlayerInformation, game.player2);
            socket.broadcast.to(roomId).emit(SocketEvents.UpdateOpponentInformation, game.player1);
        } else {
            socket.emit(SocketEvents.UpdatePlayerInformation, game.player2);
            socket.emit(SocketEvents.UpdateOpponentInformation, game.player1);
            socket.broadcast.to(roomId).emit(SocketEvents.UpdatePlayerInformation, game.player1);
            socket.broadcast.to(roomId).emit(SocketEvents.UpdateOpponentInformation, game.player2);
        }
        this.socketManager.emitRoom(roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve);
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

    private abandonGame(socket: Socket) {
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        // Passed 2 hours trying to test it and it was hell | it won't matter since the other would have left the room
        // socket.broadcast.to(room).emit(SocketEvents.OpponentGameLeave);
        // socket.broadcast.to(room).emit(SocketEvents.GameEnd);
        this.socketManager.emitRoom(room, SocketEvents.OpponentGameLeave);
        this.socketManager.emitRoom(room, SocketEvents.GameEnd);
    }

    private disconnect(socket: Socket) {
        let tempTime = 5;
        setInterval(() => {
            tempTime = tempTime - 1;
            if (tempTime === 0) {
                let player: Player;
                if (this.players.has(socket.id)) {
                    player = this.players.get(socket.id) as Player;
                    const room = player.room;
                    socket.broadcast.to(room).emit(SocketEvents.OpponentGameLeave);
                    socket.broadcast.to(room).emit(SocketEvents.GameEnd);
                }
            }
        }, SECOND);
    }
}
