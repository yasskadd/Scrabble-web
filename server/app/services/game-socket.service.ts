import { Player } from '@app/classes/player';
import { PlacementCommandInfo } from '@app/command-info';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { Container, Service } from 'typedi';
import { GameService } from './game.service';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';
import { TurnService } from './turn.service';

type PlayInfo = { gameboard: Coordinate[]; activePlayer: string | undefined };
interface GameParam {
    game: GameService | undefined;
    players: Player[];
}

interface GameScrabbleInformation {
    playerName: string[];
    roomId: string;
    timer: number;
    socketId: string[];
}

@Service()
export class GameSocket {
    players: Map<string, Player>;
    games: Map<string, GameParam>;

    constructor(private socketManager: SocketManager) {
        this.players = new Map();
        this.games = new Map();
    }

    initSocketsEvents(): void {
        // this.socketManager.on('createRoom', (socket, room: string) => {
        //     if (!this.games.has(room)) {
        //         const newPlayer = new Player(socket.id);
        //         this.players.set(socket.id, newPlayer);
        //         const newGameParam: GameParam = { game: undefined, players: [newPlayer] };
        //         this.games.set(room, newGameParam);
        //         socket.join(room);
        //     }
        // });

        // this.socketManager.io('join', (sio, socket, room: string) => {
        //     let gameParam: GameParam;

        //     if (this.games.has(room)) {
        //         gameParam = this.games.get(room) as GameParam;
        //         if (gameParam.players.length !== 2 && gameParam.players[0].name !== socket.id) {
        //             const newPlayer = new Player(socket.id);
        //             this.players.set(socket.id, newPlayer);
        //             gameParam.players.push(newPlayer);
        //             socket.join(room);
        //             sio.to(room).emit('joined', gameParam.players[0], gameParam.players[1]);
        //         } else if (this.games.has(room) && gameParam.players.length === 2) {
        //             // TODO : Emit something that says the player already joined
        //         } else {
        //             // emit que room  existe pas
        //         }
        //     }
        // });
        // room: string, time: number
        this.socketManager.io('createScrabbleGame', (sio, socket, gameInfo: GameScrabbleInformation) => {
            let gameParam: GameParam;

            const newPlayer1 = new Player(gameInfo.playerName[0]);
            newPlayer1.room = gameInfo.roomId;
            this.players.set(gameInfo.socketId[0], newPlayer1);
            const newGameParam: GameParam = { game: undefined, players: [newPlayer1] };
            this.games.set(gameInfo.roomId, newGameParam);
            gameParam = this.games.get(gameInfo.roomId) as GameParam;
            const newPlayer2 = new Player(gameInfo.playerName[1]);
            newPlayer2.room = gameInfo.roomId;
            this.players.set(gameInfo.socketId[1], newPlayer2);
            gameParam.players.push(newPlayer2);

            if (this.games.has(gameInfo.roomId)) {
                gameParam = this.games.get(gameInfo.roomId) as GameParam;
                if (gameParam.game === undefined) {
                    const player1 = gameParam.players[0];
                    const player2 = gameParam.players[1];
                    const newGame = new GameService(
                        player1,
                        player2,
                        new TurnService(60),
                        new LetterReserveService(),
                        Container.get(LetterPlacementService),
                    );
                    gameParam.game = newGame;
                    this.games.set(gameInfo.roomId, gameParam);

                    if (socket.id === gameInfo.socketId[0]) {
                        socket.emit('UpdateMyPlayerInformation', gameParam.game.player1);
                        socket.emit('UpdateOpponentInformation', gameParam.game.player2);
                        socket.broadcast.to(gameInfo.roomId).emit('UpdateMyPlayerInformation', gameParam.game.player2);
                        socket.broadcast.to(gameInfo.roomId).emit('UpdateOpponentInformation', gameParam.game.player1);
                    }
                    // else {
                    //     socket.emit(SocketEvents.ViewUpdate, gameParam.game.player2.rack);
                    //     socket.broadcast.to(gameInfo.roomId).emit(SocketEvents.ViewUpdate, gameParam.game.player1.rack);
                    // }
                    const playerInfo: PlayInfo = {
                        gameboard: gameParam.game.gameboard.gameboardCoords,
                        activePlayer: gameParam.game.turn.activePlayer,
                    };
                    gameParam.game.turn.endTurn.subscribe(() => {
                        const game = this.games.get(gameInfo.roomId);
                        const gameClientInfo = {
                            gameboard: game?.game?.gameboard.gameboardCoords,
                            players: game?.players,
                            activePlayer: game?.game?.turn.activePlayer,
                        };
                        this.socketManager.emitRoom(gameInfo.roomId, SocketEvents.Skip, gameClientInfo);
                    });
                    sio.to(gameInfo.roomId).emit(SocketEvents.ViewUpdate, playerInfo);
                }
            }
        });

        this.socketManager.io(SocketEvents.Play, (sio, socket, commandInfo: PlacementCommandInfo) => {
            let player: Player;
            if (this.players.has(socket.id)) {
                player = this.players.get(socket.id) as Player;
                const room = player.room;
                const gameParam = this.games.get(room) as GameParam;
                const game = gameParam.game as GameService;
                const played = game.play(player.name, commandInfo);
                if (played[0]) {
                    // sio.to(room).emit(SocketEvents.Play, player.name, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
                const playerInfo: PlayInfo = {
                    gameboard: game.gameboard.gameboardCoords,
                    activePlayer: game.turn.activePlayer,
                };
                sio.to(room).emit(SocketEvents.ViewUpdate, playerInfo);
                socket.emit('UpdateMyPlayerInformation', game.player1);
                socket.emit('UpdateOpponentInformation', game.player2);
                socket.broadcast.to(room).emit('UpdateMyPlayerInformation', game.player2);
                socket.broadcast.to(room).emit('UpdateOpponentInformation', game.player1);
            }
        });

        // socket.on (io.emit)

        this.socketManager.io(SocketEvents.Exchange, (sio, socket, letters: Letter[]) => {
            let player: Player;

            if (this.players.has(socket.id)) {
                player = this.players.get(socket.id) as Player;
                const room = player.room;
                const gameParam = this.games.get(room) as GameParam;
                const game = gameParam.game as GameService;
                const newRack = game.exchange(letters, player.name);

                if (newRack.length !== 0) {
                    socket.emit(SocketEvents.ViewUpdate, newRack);
                    sio.to(room).emit(SocketEvents.Play, player, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            }
        });

        this.socketManager.io(SocketEvents.Skip, (sio, socket) => {
            let player: Player;

            if (this.players.has(socket.id)) {
                player = this.players.get(socket.id) as Player;
                const room = player.room;
                const gameParam = this.games.get(room) as GameParam;
                const game = gameParam.game as GameService;
                const skip = game.skip(player.name);

                if (skip) {
                    sio.to(room).emit('skipped', player, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            }
        });
    }
}
