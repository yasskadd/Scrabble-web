import { Gameboard } from '@app/classes/gameboard.class';
import { BeginnerBot } from '@app/classes/player/bot-beginner.class';
import { Player } from '@app/classes/player/player.class';
import { RealPlayer } from '@app/classes/player/real-player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { CommandInfo } from '@app/interfaces/command-info';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Socket } from 'socket.io';
import { Container, Service } from 'typedi';
import { Game } from './game.service';
import { LetterPlacementService, PlaceLettersReturn } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';
import { WordSolverService } from './word-solver.service';

const MAX_SKIP = 6;
const SECOND = 1000;
const CHAR_ASCII = 96;

interface GameScrabbleInformation {
    playerName: string[];
    roomId: string;
    timer: number;
    socketId: string[];
}

@Service()
export class GamesHandler {
    private players: Map<string, Player>;
    private gamePlayers: Map<string, Player[]>;

    constructor(
        private socketManager: SocketManager,
        private readonly scoreStorage: ScoreStorageService,
        private wordSolver: WordSolverService,
        private letterPlacement: LetterPlacementService,
    ) {
        this.players = new Map();
        this.gamePlayers = new Map();
    }
    initSocketsEvents(): void {
        this.socketManager.on(SocketEvents.CreateScrabbleGame, (socket, gameInfo: GameScrabbleInformation) => this.createGame(socket, gameInfo));

        this.socketManager.on(SocketEvents.Play, (socket, commandInfo: CommandInfo) => {
            this.playGame(socket, commandInfo);
        });

        this.socketManager.on(SocketEvents.Exchange, (socket, letters: string[]) => {
            this.exchange(socket, letters);
        });

        this.socketManager.on(SocketEvents.ReserveCommand, (socket) => {
            this.reserveCommand(socket);
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

        this.socketManager.on(SocketEvents.ClueCommand, (socket) => {
            this.clueCommand(socket);
        });
    }

    private clueCommand(this: this, socket: Socket) {
        const letterString: string[] = [];
        const player = this.players.get(socket.id) as Player;
        this.wordSolver.setGameboard(player.game.gameboard as Gameboard);
        player.rack.forEach((letter) => {
            letterString.push(letter.value);
        });
        const wordToChoose: CommandInfo[] = this.configureClueCommand(this.wordSolver.findAllOptions(letterString));
        socket.emit(SocketEvents.ClueCommand, wordToChoose);
    }
    // TODO : TEST
    private configureClueCommand(commandInfoList: CommandInfo[]): CommandInfo[] {
        const wordToChoose: CommandInfo[] = [];
        for (let i = 0; i < 3; i++) {
            if (commandInfoList.length === 0) break;
            const random = Math.floor(Math.random() * commandInfoList.length);
            wordToChoose.push(commandInfoList[random]);
            commandInfoList.splice(random, 1);
        }
        return wordToChoose;
    }

    private reserveCommand(this: this, socket: Socket) {
        if (!this.players.has(socket.id)) return;
        const player = this.players.get(socket.id) as Player;
        socket.emit(SocketEvents.AllReserveLetters, player.game.letterReserve.lettersReserve);
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
        if (!this.letterPlacement.areLettersInRack(letters, player)) {
            socket.emit(SocketEvents.ImpossibleCommandError, 'Vous ne possédez pas toutes les lettres à échanger');
            return;
        }
        player.exchangeLetter(letters);
        socket.broadcast.to(player.room).emit(SocketEvents.GameMessage, `!echanger ${lettersToExchange} lettres`);
        this.updatePlayerInfo(socket, player.room, player.game);
        this.socketManager.emitRoom(player.room, SocketEvents.Play, player.getInformation(), player.game.turn.activePlayer);
    }

    private playGame(this: this, socket: Socket, commandInfo: CommandInfo) {
        if (!this.players.has(socket.id)) return;
        let direction: string;
        if (commandInfo.isHorizontal === undefined) direction = '';
        else direction = commandInfo.isHorizontal ? 'h' : 'v';

        const commandWrite = `!placer ${String.fromCharCode(CHAR_ASCII + commandInfo.firstCoordinate.y)}${
            commandInfo.firstCoordinate.x
        }${direction} ${commandInfo.letters.join('')}`;
        const player = this.players.get(socket.id) as RealPlayer;
        const play = player.placeLetter(commandInfo);

        if (typeof play === 'string') {
            socket.emit(SocketEvents.ImpossibleCommandError, play);
            return;
        }
        this.socketManager.emitRoom(player.room, SocketEvents.ViewUpdate, {
            gameboard: play.gameboard.gameboardTiles,
            activePlayer: player.game.turn.activePlayer,
        });
        this.updatePlayerInfo(socket, player.room, player.game);
        this.sendValidCommand(play, socket, player.room, commandWrite);
    }

    private sendValidCommand(play: PlaceLettersReturn, socket: Socket, room: string, commandWrite: string) {
        if (play.hasPassed) {
            socket.broadcast.to(room).emit(SocketEvents.GameMessage, commandWrite);
            return;
        }
        play.invalidWords.forEach((invalidWord: Word) =>
            socket.emit(SocketEvents.ImpossibleCommandError, 'Le mot "' + invalidWord.stringFormat + '" ne fait pas partie du dictionnaire français'),
        );
    }

    private createGame(this: this, socket: Socket, gameInfo: GameScrabbleInformation) {
        const playerOne = this.setAndGetPlayer(gameInfo);
        const playerTwo = this.setAndGetPlayer(gameInfo);
        const game = this.createNewGame(gameInfo);

        this.initializePlayers([playerOne, playerTwo], game, gameInfo.socketId);
        this.updatePlayerInfo(socket, playerOne.room, game);
        this.gameSubscriptions(gameInfo, game);

        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.ViewUpdate, {
            gameboard: game.gameboard.gameboardTiles,
            activePlayer: game.turn.activePlayer,
        });
        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve);
    }
    // TODO : TEST
    private initializePlayers(players: Player[], game: Game, socketId: string[]) {
        (players[0] as RealPlayer).setGame(game, true);
        if (socketId.length === 1) {
            (players[1] as BeginnerBot).setGame(game);
            (players[1] as BeginnerBot).start();
            return;
        }
        (players[1] as RealPlayer).setGame(game, false);
    }
    // TODO : TEST
    private gameSubscriptions(gameInfo: GameScrabbleInformation, game: Game) {
        game.turn.endTurn.subscribe(() => {
            this.endGameScore(gameInfo.roomId);
            this.changeTurn(gameInfo.roomId);
            if (game.turn.activePlayer === undefined) {
                this.userConnected(gameInfo.socketId);
            }
        });

        game.turn.countdown.subscribe((timer: number) => {
            this.sendTimer(gameInfo.roomId, timer);
        });
    }

    private endGameScore(roomID: string) {
        const players = this.gamePlayers.get(roomID) as Player[];
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
        const player = this.players.has(gameInfo.socketId[0]) ? 1 : 0;
        let newPlayer: Player;
        if (player === 1 && gameInfo.socketId[player] === undefined) {
            newPlayer = new BeginnerBot(false, gameInfo.playerName[player], { timer: gameInfo.timer, roomId: gameInfo.roomId });
        } else {
            newPlayer = new RealPlayer(gameInfo.playerName[player]);
            newPlayer.room = gameInfo.roomId;
            this.players.set(gameInfo.socketId[player], newPlayer);
        }
        if (this.gamePlayers.get(newPlayer.room) === undefined) this.gamePlayers.set(newPlayer.room, [] as Player[]);
        (this.gamePlayers.get(newPlayer.room) as Player[]).push(newPlayer);
        return newPlayer;
    }

    private createNewGame(gameInfo: GameScrabbleInformation): Game {
        const players = this.gamePlayers.get(gameInfo.roomId) as Player[];
        return new Game(players[0], players[1], new Turn(gameInfo.timer), new LetterReserveService(), Container.get(LetterPlacementService));
    }

    private updatePlayerInfo(socket: Socket, roomId: string, game: Game) {
        const player = this.players.get(socket.id) as Player;
        const players = this.gamePlayers.get(player.room) as Player[];
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
        const players = this.gamePlayers.get(roomId) as Player[];
        // Might crash server in an unforseen event
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
        if (!this.players.has(socket.id)) return;

        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
        this.socketManager.emitRoom(room, SocketEvents.OpponentGameLeave);
        this.players.delete(socket.id);
        socket.leave(room);
        player.game.abandon();
    }

    private disconnect(socket: Socket) {
        if (!this.players.has(socket.id)) return;
        const player = this.players.get(socket.id) as Player;
        const room = player.room;
        if (this.gamePlayers.get(player.room) !== undefined && !player.game.isGameFinish) {
            this.waitBeforeDisconnect(socket, room, player);
            return;
        }
        socket.leave(room);
        this.players.delete(socket.id);
        this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
    }
    // TODO : TEST
    private waitBeforeDisconnect(socket: Socket, room: string, player: Player) {
        let tempTime = 5;
        setInterval(() => {
            tempTime = tempTime - 1;
            if (tempTime === 0) {
                if (!this.players.has(socket.id)) return;
                socket.leave(room);
                this.players.delete(socket.id);
                this.socketManager.emitRoom(room, SocketEvents.UserDisconnect);
                this.socketManager.emitRoom(room, SocketEvents.OpponentGameLeave);
                player.game?.abandon();
            }
        }, SECOND);
    }

    private endGame(socketId: string) {
        const player = this.players.get(socketId) as Player;
        if (this.gamePlayers.get(player.room) !== undefined && !player.game.isGameFinish) {
            player.game.isGameFinish = true;
            this.socketManager.emitRoom(player.room, SocketEvents.GameEnd);
        }
    }

    private async sendHighScore(socketId: string) {
        const player = this.players.get(socketId) as Player;
        await this.scoreStorage.addTopScores({ username: player.name, type: 'Classique', score: player.score });
    }

    private async userConnected(socketId: string[]) {
        if (this.players.get(socketId[0]) && this.players.get(socketId[1])) {
            this.endGame(socketId[0]);
            await this.sendHighScore(socketId[0]);
            await this.sendHighScore(socketId[1]);
            return;
        }
        if (this.players.get(socketId[0])) {
            this.endGame(socketId[0]);
            await this.sendHighScore(socketId[0]);
            return;
        }
        if (this.players.get(socketId[1])) {
            this.endGame(socketId[1]);
            await this.sendHighScore(socketId[1]);
        }
    }
}
