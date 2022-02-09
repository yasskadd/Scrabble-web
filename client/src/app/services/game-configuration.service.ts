import { Injectable } from '@angular/core';
import { GameParameters } from '@app/classes/game-parameters';
import { GameRoomClient } from '@app/classes/game-room-client';
import { SocketEvents } from '@common/socket-events';
import { ReplaySubject } from 'rxjs';
import { ClientSocketService } from './client-socket.service';

const FOUND_OPPONENT_MESSAGE = 'Adversaire Trouvé';
const SEARCHING_OPPONENT = "En Attente d'un Adversaire ...";
const WAITING_OPPONENT_CONFIRMATION = "En Attente de la confirmation de L'adversaire";
@Injectable({
    providedIn: 'root',
})
export class GameConfigurationService {
    availableRooms: GameRoomClient[];
    statusGame: string;
    isCreator: boolean;
    playerName: string[];
    roomId: string;
    isGameStarted: ReplaySubject<boolean>;
    isRoomJoinable: ReplaySubject<boolean>;
    errorReason: ReplaySubject<string>;

    constructor(private clientSocket: ClientSocketService) {
        this.playerName = [];
        this.availableRooms = [];
        this.clientSocket.establishConnection();
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
        this.isGameStarted = new ReplaySubject<boolean>(1);
        this.errorReason = new ReplaySubject<string>(1);
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.clientSocket.on(SocketEvents.JoinValidGame, (playerName: string) => {
            this.isCreator = false;
            this.statusGame = WAITING_OPPONENT_CONFIRMATION;
            this.isRoomJoinable.next(true);
            this.resetRoomJoinableSubject();
            this.playerName[1] = playerName;
        });

        this.clientSocket.on(SocketEvents.RejectByOtherPlayer, (reason: string) => {
            this.clientSocket.send(SocketEvents.RejectByOtherPlayer, { id: this.roomId, name: this.playerName[0] });
            this.roomId = '';
            this.playerName = [];
            this.statusGame = '';
            this.errorReason.next(reason);
            this.resetErrorSubject();
        });

        this.clientSocket.on(SocketEvents.GameAboutToStart, () => {
            this.isGameStarted.next(true);
            this.resetIsGameStartedSubject();
        });

        this.clientSocket.on(SocketEvents.FoundAnOpponent, (opponentName: string) => {
            this.playerName[1] = opponentName;
            this.statusGame = FOUND_OPPONENT_MESSAGE;
        });
        this.clientSocket.on(SocketEvents.GameCreatedConfirmation, (roomId: string) => {
            this.roomId = roomId;
        });

        this.clientSocket.on(SocketEvents.UpdateRoomJoinable, (gamesToJoin: GameRoomClient[]) => {
            this.updateAvailableRooms(gamesToJoin);
        });

        this.clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            this.errorReason.next(reason);
            this.resetErrorSubject();
        });
        this.clientSocket.on('OpponentLeave', () => {
            this.statusGame = SEARCHING_OPPONENT;
            this.playerName.pop();
        });
    }

    resetIsGameStartedSubject() {
        this.isGameStarted = new ReplaySubject<boolean>(1);
    }
    resetRoomJoinableSubject() {
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
    }
    resetErrorSubject() {
        this.errorReason = new ReplaySubject<string>(1);
    }

    removeRoom() {
        if (this.playerName[1]) {
            this.rejectOpponent();
            this.clientSocket.send(SocketEvents.RemoveRoom, this.roomId);
            this.roomId = '';
            this.playerName.pop();
        } else {
            this.clientSocket.send(SocketEvents.RemoveRoom, this.roomId);
            this.roomId = '';
            this.playerName.pop();
        }
    }

    exitWaitingRoom() {
        this.clientSocket.send('exitWaitingRoom', { id: this.roomId, name: this.playerName[0] });
        this.roomId = '';
        this.playerName = [];
        this.statusGame = '';
    }

    rejectOpponent() {
        this.clientSocket.send(SocketEvents.RejectOpponent, this.roomId);
        this.statusGame = SEARCHING_OPPONENT;
        this.playerName.pop();
    }

    gameInitialization(parameters: GameParameters) {
        this.clientSocket.send(SocketEvents.CreateGame, parameters);
        this.playerName[0] = parameters.username;
        this.isCreator = true;
        this.statusGame = SEARCHING_OPPONENT;
    }

    joinGame(roomId: string, username: string) {
        this.clientSocket.send(SocketEvents.PlayerJoinGameAvailable, { id: roomId, name: username });
        this.playerName[0] = username;
        this.roomId = roomId;
    }
    joinPage() {
        this.clientSocket.send(SocketEvents.RoomLobby);
    }

    beginScrabbleGame() {
        this.clientSocket.send(SocketEvents.StartScrabbleGame, this.roomId);
    }
    private updateAvailableRooms(availableRooms: GameRoomClient[]) {
        this.availableRooms = availableRooms;
    }
    // Sprint 2
    // joinRandomRoom(playerName: string) {
    //     const random = Math.floor(Math.random() * this.availableRooms.length);
    //     const roomToJoinId = this.availableRooms[random].id;
    //     this.clientSocket.send('roomJoin', { roomToJoinId, playerName });
    // }
}
