import { Game } from '@app/classes/game.class';
import { LetterReserve } from '@app/classes/letter-reserve.class';
import { BeginnerBot } from '@app/classes/player/beginner-bot.class';
import { Bot } from '@app/classes/player/bot.class';
import { ExpertBot } from '@app/classes/player/expert-bot.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn.class';
import { GameScrabbleInformation } from '@app/interfaces/game-scrabble-information';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { RackService } from '@app/services/rack.service';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Socket } from 'socket.io';
import { Container, Service } from 'typedi';
import { GamesHandler } from './games-handler.service';

const MAX_SKIP = 6;
const SECOND = 1000;

@Service()
export class GamesStateService {
    constructor(private socketManager: SocketManager, private gamesHandler: GamesHandler, private readonly scoreStorage: ScoreStorageService) {}

    initSocketsEvents(): void {
        this.socketManager.on(SocketEvents.CreateScrabbleGame, (socket, gameInfo: GameScrabbleInformation) => this.createGame(socket, gameInfo));

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

    private createGame(this: this, socket: Socket, gameInfo: GameScrabbleInformation) {
        const playerOne = this.setAndGetPlayer(gameInfo);
        const playerTwo = this.setAndGetPlayer(gameInfo);
        const game = this.createNewGame(gameInfo);

        this.initializePlayers([playerOne, playerTwo], game, gameInfo.socketId);
        this.gamesHandler.updatePlayerInfo(socket, playerOne.room, game);
        this.gameSubscriptions(gameInfo, game);

        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.ViewUpdate, {
            gameboard: game.gameboard.gameboardTiles,
            activePlayer: game.turn.activePlayer,
        });
        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve);
    }

    private initializePlayers(players: Player[], game: Game, socketId: string[]) {
        (players[0] as RealPlayer).setGame(game, true);
        if (socketId.length === 1) {
            (players[1] as Bot).setGame(game);
            (players[1] as Bot).start();
            game.isModeSolo = true;
            return;
        }
        (players[1] as RealPlayer).setGame(game, false);
    }

    private gameSubscriptions(gameInfo: GameScrabbleInformation, game: Game) {
        game.turn.endTurn.subscribe(() => {
            this.endGameScore(gameInfo.roomId);
            this.changeTurn(gameInfo.roomId);
            if (game.turn.activePlayer === undefined) this.userConnected(gameInfo.socketId, gameInfo.roomId);
        });

        game.turn.countdown.subscribe((timer: number) => {
            this.sendTimer(gameInfo.roomId, timer);
        });
    }

    private endGameScore(roomID: string) {
        const players = this.gamesHandler.gamePlayers.get(roomID) as Player[];
        if (players[0].game.turn.skipCounter === MAX_SKIP) {
            players.forEach((player) => {
                player.deductPoints();
            });
            return;
        }
        if (players[0].rackIsEmpty()) {
            players[0].addPoints(players[1].rack);
            players[1].deductPoints();
            return;
        }
        if (players[1].rackIsEmpty()) {
            players[1].addPoints(players[0].rack);
            players[0].deductPoints();
        }
    }

    private setAndGetPlayer(gameInfo: GameScrabbleInformation): Player {
        const player = this.gamesHandler.players.has(gameInfo.socketId[0]) ? 1 : 0;
        let newPlayer: Player;
        if (player === 1 && gameInfo.socketId[player] === undefined && gameInfo.botDifficulty !== undefined) {
            if (gameInfo.botDifficulty === 'Débutant')
                newPlayer = new BeginnerBot(false, gameInfo.playerName[player], {
                    timer: gameInfo.timer,
                    roomId: gameInfo.roomId,
                    dictionary: gameInfo.dictionary.words,
                });
            else
                newPlayer = new ExpertBot(false, gameInfo.playerName[player], {
                    timer: gameInfo.timer,
                    roomId: gameInfo.roomId,
                    dictionary: gameInfo.dictionary.words,
                });
        } else {
            newPlayer = new RealPlayer(gameInfo.playerName[player]);
            newPlayer.room = gameInfo.roomId;
            this.gamesHandler.players.set(gameInfo.socketId[player], newPlayer);
        }
        if (this.gamesHandler.gamePlayers.get(newPlayer.room) === undefined) this.gamesHandler.gamePlayers.set(newPlayer.room, [] as Player[]);
        (this.gamesHandler.gamePlayers.get(newPlayer.room) as Player[]).push(newPlayer);
        return newPlayer;
    }

    private createNewGame(gameInfo: GameScrabbleInformation): Game {
        const players = this.gamesHandler.gamePlayers.get(gameInfo.roomId) as Player[];
        return new Game(
            players[0],
            players[1],
            gameInfo.dictionary.words,
            new Turn(gameInfo.timer),
            new LetterReserve(),
            new LetterPlacementService(gameInfo.dictionary.words, Container.get(RackService)),
        );
    }

    private changeTurn(roomId: string) {
        const players = this.gamesHandler.gamePlayers.get(roomId) as Player[];
        const gameInfo = {
            gameboard: players[0].game.gameboard.gameboardTiles,
            players: players.map((x) => x.getInformation()),
            activePlayer: players[0].game.turn.activePlayer,
        };
        this.socketManager.emitRoom(roomId, SocketEvents.Skip, gameInfo);
    }

    private sendTimer(roomId: string, timer: number) {
        this.socketManager.emitRoom(roomId, SocketEvents.TimerClientUpdate, timer);
    }

    private abandonGame(socket: Socket) {
        if (!this.gamesHandler.players.has(socket.id)) return;

        const player = this.gamesHandler.players.get(socket.id) as Player;
        const room = player.room;
        this.gamesHandler.players.delete(socket.id);
        socket.leave(room);
        if (!player.game.isModeSolo) {
            this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
            this.switchToSolo(socket, player);
            return;
        }
        player.game.abandon();
    }

    private switchToSolo(socket: Socket, playerToReplace: Player) {
        const info = playerToReplace.getInformation();
        const playerInRoom = this.gamesHandler.gamePlayers.get(playerToReplace.room);
        if (playerInRoom === undefined) return;
        const botPlayer = new BeginnerBot(false, 'Maurice', {
            timer: playerToReplace.game.turn.time,
            roomId: playerToReplace.room,
            dictionary: playerToReplace.game.dictionary,
        });
        botPlayer.score = info.score;
        botPlayer.rack = info.rack;

        if (playerToReplace.game.turn.activePlayer === playerToReplace.name) playerToReplace.game.turn.activePlayer = botPlayer.name;
        else playerToReplace.game.turn.inactivePlayer = botPlayer.name;
        if (playerInRoom[1] === playerToReplace) this.gamesHandler.gamePlayers.set(playerToReplace.room, [playerInRoom[0], botPlayer]);
        else this.gamesHandler.gamePlayers.set(playerToReplace.room, [botPlayer, playerInRoom[1]]);

        this.updateNewBot(socket, playerToReplace.game, playerToReplace.room, botPlayer);
    }

    private updateNewBot(socket: Socket, game: Game, roomId: string, botPlayer: Player) {
        game.isModeSolo = true;
        (botPlayer as BeginnerBot).setGame(game);
        (botPlayer as BeginnerBot).start();
        this.gamesHandler.updatePlayerInfo(socket, roomId, game);
    }

    private disconnect(socket: Socket) {
        if (!this.gamesHandler.players.has(socket.id)) return;
        const player = this.gamesHandler.players.get(socket.id) as Player;
        const room = player.room;
        if (this.gamesHandler.gamePlayers.get(player.room) !== undefined && !player.game.isGameFinish) {
            this.waitBeforeDisconnect(socket);
            return;
        }
        socket.leave(room);
        this.gamesHandler.players.delete(socket.id);
        this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
    }

    private waitBeforeDisconnect(socket: Socket) {
        let tempTime = 5;
        setInterval(() => {
            tempTime = tempTime - 1;
            if (tempTime === 0) {
                this.abandonGame(socket);
            }
        }, SECOND);
    }

    private endGame(socketId: string) {
        const player = this.gamesHandler.players.get(socketId) as Player;
        if (this.gamesHandler.gamePlayers.get(player.room) !== undefined && !player.game.isGameFinish) {
            player.game.isGameFinish = true;
            this.socketManager.emitRoom(player.room, SocketEvents.GameEnd);
        }
    }

    private async sendHighScore(socketId: string) {
        const player = this.gamesHandler.players.get(socketId) as Player;
        await this.scoreStorage.addTopScores({ username: player.name, type: 'Classique', score: player.score });
    }

    private async userConnected(socketId: string[], roomId: string) {
        const player1Room = this.gamesHandler.players.get(socketId[0])?.room;
        const player2Room = this.gamesHandler.players.get(socketId[1])?.room;
        if (player1Room === roomId && player2Room === roomId) {
            this.endGame(socketId[0]);
            await this.sendHighScore(socketId[0]);
            await this.sendHighScore(socketId[1]);
            return;
        }
        if (player1Room === roomId) {
            this.endGame(socketId[0]);
            await this.sendHighScore(socketId[0]);
            return;
        }
        if (player2Room === roomId) {
            this.endGame(socketId[1]);
            await this.sendHighScore(socketId[1]);
        }
    }
}
