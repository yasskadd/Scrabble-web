import { Player } from '@app/classes/player';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { GameService } from './game.service';

interface GameParam {
    game: GameService | undefined;
    players: Player[];
}

@Service()
export class GameSocket {
    players: Map<string, Player>;
    games: Map<string, GameParam>;
    sio: io.Server;

    constructor(server: http.Server) {
        this.players = new Map();
        this.games = new Map();
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('createRoom', (room: string) => {
                if (!this.games.has(room)) {
                    const newPlayer = new Player(socket.id);
                    this.players.set(socket.id, newPlayer);
                    const newGameParam = { game: undefined, players: [newPlayer] };
                    this.games.set(room, newGameParam);
                    socket.join(room);
                }
            });

            socket.on('join', (room: string) => {
                if (this.games.has(room) && this.games.get(room).players.length !== 2 && this.games.get(room).players[0].name !== socket.id) {
                    const newPlayer = new Player(socket.id);
                    this.players.set(socket.id, newPlayer);
                    this.games.get(room).players.push(newPlayer);
                    socket.join(room);
                    io.to(room).emit('joined', this.games.get(room).players[0], this.games.get(room).players[1]);
                } else if (this.games.has(room) && this.games.get(room).players.length === 2) {
                    // TODO : Emit something that says the player already joined
                } else {
                    // TODO : Emit something that says theres no such room
                }
            });

            socket.on('start', (room: string) => {
                if (this.games.has(room) && this.games.get(room).game === undefined) {
                    const player1 = this.games.get(room).players[0];
                    const player2 = this.games.get(room).players[1];
                    const newGame = new GameService(player1, player2, 30);
                    this.games.get(room).game = newGame;

                    if (socket.id === this.games.get(room).game.player1.name) {
                        socket.emit('update-view', this.games.get(room).game.player1.rack);
                        socket.to(room).emit('update-view', this.games.get(room).game.player2.rack);
                    } else {
                        socket.emit('update-view', this.games.get(room).game.player2.rack);
                        socket.to(room).emit('update-view', this.games.get(room).game.player1.rack);
                    }
                }
            });

            socket.on('play', () => {
                const room = this.players.get(socket.id).room;
                const player = this.players.get(socket.id).name;
                const game = this.games.get(room).game;
                const played = game.play(player);
                if (played) {
                    this.sio.to(room).emit('play', player, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            });

            socket.on('exchange', () => {
                const room = this.players.get(socket.id).room;
                const player = this.players.get(socket.id).name;
                const game = this.games.get(room).game;
                const newRack = game.exchange(player);

                if (newRack.length !== 0) {
                    socket.emit('update-view', newRack);
                    this.sio.to(room).emit('play', player, game.turn.activePlayer);
                    this.sio.to(room).emit('console', game.letterReserve);
                    socket.emit('console', newRack);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            });

            socket.on('skip', () => {
                const room = this.players.get(socket.id).room;
                const player = this.players.get(socket.id).name;
                const game = this.games.get(room).game;
                const skip = game.skip(player);

                if (skip) {
                    io.to(room).emit('skipped', player, game.turn.activePlayer);
                } else {
                    // TODO : Emit something that says it is not its turn
                }
            });
        });
    }
}
