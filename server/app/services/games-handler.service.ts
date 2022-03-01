import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/command-info';
import { LetterTile } from '@common/letter-tile.class';
import { SocketEvents } from '@common/socket-events';
import { Socket } from 'socket.io';
import { Container, Service } from 'typedi';
import { Game } from './game.service';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';

const SECOND = 1000;
const CHAR_ASCII = 96;
type PlayInfo = { gameboard: LetterTile[]; activePlayer: string | undefined };
interface GameHolder {
    game: Game | undefined;
    players: RealPlayer[];
    roomId: string;
    isGameFinish: boolean;
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
        this.socketManager.on(SocketEvents.CreateScrabbleGame, (socket, gameInfo: GameScrabbleInformation) => this.createGame(socket, gameInfo));

        this.socketManager.on(SocketEvents.Play, (socket, commandInfo: CommandInfo) => {
            this.playGame(socket, commandInfo);
        });

        this.socketManager.on(SocketEvents.Exchange, (socket, letters: string[]) => {
            this.exchange(socket, letters);
        });

        this.socketManager.on(SocketEvents.Skip, (socket) => {
            this.skip(socket);
        });

        this.socketManager.on(SocketEvents.Disconnect, (socket) => {
            this.disconnect(socket);
        });

        this.socketManager.on(SocketEvents.AbandonGame, (socket) => {
            this.abandonGame(socket);
        });

        this.socketManager.on(SocketEvents.QuitGame, (socket) => {
            this.disconnect(socket);
        });
    }

    private skip(this: this, socket: Socket) {
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as RealPlayer;
        player.skipTurn();
        socket.broadcast.to(player.room).emit(SocketEvents.GameMessage, '!passer');
    }

    private exchange(this: this, socket: Socket, letters: string[]) {
        if (!this.players.has(socket.id)) return;
        const lettersToExchange = letters.length;
        const player = this.players.get(socket.id) as RealPlayer;
        const oldPlayerRack = player.rack;
        const game = player.game;
        player.exchangeLetter(letters);

        if (player.rack.length === 0) return;
        if (JSON.stringify(oldPlayerRack) === JSON.stringify(player.rack)) {
            socket.emit(SocketEvents.ImpossibleCommandError, 'Vous ne posséder pas toutes les lettres a échanger');
        } else {
            socket.broadcast.to(player.room).emit(SocketEvents.GameMessage, `!echanger ${lettersToExchange} lettres`);
        }
        this.updatePlayerInfo(socket, player.room, game);
        this.socketManager.emitRoom(player.room, SocketEvents.Play, player.getInformation(), game.turn.activePlayer);
    }

    private playGame(this: this, socket: Socket, commandInfo: CommandInfo) {
        if (!this.players.has(socket.id)) return;
        const firstCoordinateColumns = commandInfo.firstCoordinate.x;
        const firstCoordinateRows = commandInfo.firstCoordinate.y;
        const letterPlaced = commandInfo.lettersPlaced.join('');
        const player = this.players.get(socket.id) as RealPlayer;
        const play = player.placeLetter(commandInfo) as [boolean, Gameboard] | string;

        if (typeof play[0] === 'string') {
            socket.emit(SocketEvents.ImpossibleCommandError, play);
        } else if (typeof play !== 'string') {
            const playerInfo: PlayInfo = {
                gameboard: play[1].gameboardCoords,
                activePlayer: player.game.turn.activePlayer,
            };
            this.socketManager.emitRoom(player.room, SocketEvents.ViewUpdate, playerInfo);
            this.updatePlayerInfo(socket, player.room, player.game);

            if (!play[0]) {
                socket.emit(SocketEvents.ImpossibleCommandError, 'Les lettres que vous essayer de mettre ne forme pas des mots valides');
            } else {
                socket.broadcast
                    .to(player.room)
                    .emit(
                        SocketEvents.GameMessage,
                        `!placer ${String.fromCharCode(CHAR_ASCII + firstCoordinateRows)}${firstCoordinateColumns}${
                            commandInfo.direction
                        } ${letterPlaced}`,
                    );
            }
        }
    }

    private createGame(this: this, socket: Socket, gameInfo: GameScrabbleInformation) {
        const playerOne = this.setAndGetPlayer(gameInfo);
        const newGameHolder: GameHolder = { game: undefined, players: [playerOne], roomId: gameInfo.roomId, isGameFinish: false };
        const playerTwo = this.setAndGetPlayer(gameInfo);

        newGameHolder.players.push(playerTwo);
        newGameHolder.game = this.createNewGame(newGameHolder);

        playerOne.setGame(newGameHolder.game, true);
        playerTwo.setGame(newGameHolder.game, false);

        this.games.set(newGameHolder.roomId, newGameHolder);
        if (socket.id === gameInfo.socketId[0]) {
            this.updatePlayerInfo(socket, newGameHolder.roomId, newGameHolder.game);
        }
        newGameHolder.game.turn.endTurn.subscribe(() => {
            this.changeTurn(gameInfo.roomId);
            if (newGameHolder.game?.turn.activePlayer === undefined) {
                this.endGame(socket);
            }
        });
        newGameHolder.game.turn.countdown.subscribe((timer: number) => {
            this.sendTimer(gameInfo.roomId, timer);
        });
        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.ViewUpdate, {
            gameboard: newGameHolder.game.gameboard.gameboardCoords,
            activePlayer: newGameHolder.game.turn.activePlayer,
        });
        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.LetterReserveUpdated, newGameHolder.game.letterReserve.lettersReserve);
    }

    private setAndGetPlayer(gameInfo: GameScrabbleInformation): RealPlayer {
        const player = this.players.has(gameInfo.socketId[0]) ? 1 : 0;
        const newPlayer = new RealPlayer(gameInfo.playerName[player]);

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
        const players = this.games.get(player.room)?.players;
        if (players === undefined) return;
        const playerIndex = player.isPlayerOne ? 0 : 1;
        const secondPlayerIndex = Math.abs(playerIndex - 1);

        socket.emit(SocketEvents.UpdatePlayerInformation, players[playerIndex].getInformation());
        socket.emit(SocketEvents.UpdateOpponentInformation, players[secondPlayerIndex].getInformation());
        socket.broadcast.to(roomId).emit(SocketEvents.UpdatePlayerInformation, players[secondPlayerIndex].getInformation());
        socket.broadcast.to(roomId).emit(SocketEvents.UpdateOpponentInformation, players[playerIndex].getInformation());

        this.socketManager.emitRoom(roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve);
    }

    private changeTurn(roomId: string) {
        const game = this.games.get(roomId);
        const gameInfo = {
            gameboard: game?.game?.gameboard.gameboardCoords,
            players: game?.players.map((x) => x.getInformation()),
            activePlayer: game?.game?.turn.activePlayer,
        };
        this.socketManager.emitRoom(roomId, SocketEvents.Skip, gameInfo);
    }

    private sendTimer(roomId: string, timer: number) {
        this.socketManager.emitRoom(roomId, SocketEvents.TimerClientUpdate, timer);
    }

    private abandonGame(socket: Socket) {
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const game = this.games.get(room);
        this.socketManager.emitRoom(room, SocketEvents.OpponentGameLeave);
        game?.game?.abandon();
        this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
        socket.leave(room);
        this.players.delete(socket.id);
    }

    private disconnect(socket: Socket) {
        if (!this.players.has(socket.id)) return;
        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const roomInfomation = this.games.get(room);
        if (roomInfomation?.players !== undefined && !roomInfomation.isGameFinish) {
            let tempTime = 5;
            setInterval(() => {
                tempTime = tempTime - 1;
                if (tempTime === 0) {
                    if (!this.players.has(socket.id)) return;
                    this.socketManager.emitRoom(room, SocketEvents.OpponentGameLeave);
                    roomInfomation.game?.abandon();
                    this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
                    socket.leave(room);
                    this.players.delete(socket.id);
                }
            }, SECOND);
        } else {
            this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
            socket.leave(room);
            this.players.delete(socket.id);
        }
    }

    private endGame(socket: Socket) {
        if (!this.players.has(socket.id)) return;
        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        const roomInfomation = this.games.get(room);
        if (roomInfomation?.players !== undefined && !roomInfomation.isGameFinish) {
            const newGameHolder: GameHolder = {
                game: roomInfomation.game,
                players: roomInfomation.players,
                roomId: roomInfomation.roomId,
                isGameFinish: true,
            };
            this.games.set(room, newGameHolder);
            this.socketManager.emitRoom(room, SocketEvents.GameEnd);
        }
    }
}
