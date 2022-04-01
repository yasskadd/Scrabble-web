import { Game } from '@app/classes/game.class';
import { Player } from '@app/classes/player/player.class';
import { SocketManager } from '@app/services/socket/socket-manager.service';
import { SocketEvents } from '@common/constants/socket-events';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class GamesHandler {
    players: Map<string, Player>;
    gamePlayers: Map<string, Player[]>;

    constructor(private socketManager: SocketManager) {
        this.players = new Map();
        this.gamePlayers = new Map();
    }

    updatePlayerInfo(socket: Socket, roomId: string, game: Game) {
        const player = this.players.get(socket.id) as Player;
        const players = this.gamePlayers.get(roomId) as Player[];
        let playerIndex: number;
        if (players === undefined) return;
        if (player === undefined) {
            if (players[0].isPlayerOne) playerIndex = 1;
            else playerIndex = 0;
        } else playerIndex = player.isPlayerOne ? 0 : 1;
        const secondPlayerIndex = Math.abs(playerIndex - 1);

        socket.emit(SocketEvents.UpdatePlayerInformation, players[playerIndex].getInformation());
        socket.emit(SocketEvents.UpdateOpponentInformation, players[secondPlayerIndex].getInformation());
        socket.broadcast.to(roomId).emit(SocketEvents.UpdatePlayerInformation, players[secondPlayerIndex].getInformation());
        socket.broadcast.to(roomId).emit(SocketEvents.UpdateOpponentInformation, players[playerIndex].getInformation());

        this.socketManager.emitRoom(roomId, SocketEvents.LetterReserveUpdated, game.letterReserve.lettersReserve);
    }
}
