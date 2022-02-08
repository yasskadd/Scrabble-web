import { GameboardCoordinate } from '@app/classes/gameboard-coordinate.class';
import { Player } from '@app/classes/player';
import { Letter } from '@app/letter';
import { Container, Service } from 'typedi';
import { GameService } from './game.service';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { SocketManager } from './socket-manager.service';
import { TurnService } from './turn.service';

interface GameParam {
    game: GameService | undefined;
    players: Player[];
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
        this.socketManager.on('createRoom', (socket, room: string) => {
            if (!this.games.has(room)) {
                const newPlayer = new Player(socket.id);
                this.players.set(socket.id, newPlayer);
                const newGameParam: GameParam = { game: undefined, players: [newPlayer] };
                this.games.set(room, newGameParam);
                socket.join(room);
            }
        });

        this.socketManager.io('join', (sio, socket, room: string) => {
            let gameParam: GameParam;

            if (this.games.has(room)) {
                gameParam = this.games.get(room) as GameParam;
                if (gameParam.players.length !== 2 && gameParam.players[0].name !== socket.id) {
                    const newPlayer = new Player(socket.id);
                    this.players.set(socket.id, newPlayer);
                    gameParam.players.push(newPlayer);
                    socket.join(room);
                    sio.to(room).emit('joined', gameParam.players[0], gameParam.players[1]);
                } else if (this.games.has(room) && gameParam.players.length === 2) {
                    // TODO : Emit something that says the player already joined
                } else {
                    // emit que room  existe pas
                }
            }
        });

        this.socketManager.on('start', (socket, room: string, time: number) => {
            let gameParam: GameParam;

            if (this.games.has(room)) {
                gameParam = this.games.get(room) as GameParam;
                if (gameParam.game === undefined) {
                    const player1 = gameParam.players[0];
                    const player2 = gameParam.players[1];
                    const newGame = new GameService(
                        player1,
                        player2,
                        new TurnService(time),
                        new LetterReserveService(),
                        Container.get(LetterPlacementService),
                    );
                    gameParam.game = newGame;

                    if (socket.id === gameParam.game.player1.name) {
                        socket.emit('update-view', gameParam.game.player1.rack);
                        socket.to(room).emit('update-view', gameParam.game.player2.rack);
                    } else {
                        socket.emit('update-view', gameParam.game.player2.rack);
                        socket.to(room).emit('update-view', gameParam.game.player1.rack);
                    }
                }
            }
        });

        this.socketManager.io('play', (sio, socket, firstCoordinate, direction, letters) => {
            let player: Player;
            if (this.players.has(socket.id)) {
                player = this.players.get(socket.id) as Player;
                const room = player.room;
                const gameParam = this.games.get(room) as GameParam;
                const game = gameParam.game as GameService;
                const played = game.play(player.name, firstCoordinate as GameboardCoordinate, direction as string, letters as string[]);
                if (played) {
                    sio.to(room).emit('play', player.name, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            }
        });

        this.socketManager.io('exchange', (sio, socket, letters: Letter[]) => {
            let player: Player;

            if (this.players.has(socket.id)) {
                player = this.players.get(socket.id) as Player;
                const room = player.room;
                const gameParam = this.games.get(room) as GameParam;
                const game = gameParam.game as GameService;
                const newRack = game.exchange(letters, player.name);

                if (newRack.length !== 0) {
                    socket.emit('update-view', newRack);
                    sio.to(room).emit('play', player, game.turn.activePlayer);
                    sio.to(room).emit('console', game.letterReserve);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            }
        });

        this.socketManager.io('skip', (sio, socket) => {
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
