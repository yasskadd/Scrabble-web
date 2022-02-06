import { Injectable } from '@angular/core';
import { GameParameters } from '@app/classes/game-parameters';
import { GameRoomClient } from '@app/classes/game-room-client';
import { ReplaySubject } from 'rxjs';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class GameConfigurationService {
    foundOpponent: boolean;
    availableRooms: GameRoomClient[] = [];
    statusGame: string;
    isCreator: boolean;
    playerName: string;
    opponentName: string;
    roomId: string;
    isGameStarted: ReplaySubject<boolean>;
    isRoomJoinable: ReplaySubject<boolean>;
    errorReason: ReplaySubject<string>;

    constructor(private clientSocket: ClientSocketService) {
        this.clientSocket.establishConnection();
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
        this.isGameStarted = new ReplaySubject<boolean>(1);
        this.errorReason = new ReplaySubject<string>(1);
        this.foundOpponent = false;
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.clientSocket.on('joinValid', (playerName: string) => {
            this.isCreator = false;
            this.statusGame = "En Attente de la confirmation de L'adversaire";
            this.isRoomJoinable.next(true);
            this.resetRoomJoinableSubject();
            this.playerName = playerName;
        });

        this.clientSocket.on('rejectByOtherPlayer', (reason: string) => {
            this.clientSocket.send('rejectByOtherPlayer', { id: this.roomId, name: this.opponentName });
            this.roomId = '';
            this.playerName = '';
            this.opponentName = '';
            this.statusGame = '';
            this.errorReason.next(reason);
            this.resetErrorSubject();
        });

        this.clientSocket.on('gameAboutToStart', () => {
            this.isGameStarted.next(true);
            this.resetIsGameStartedSubject();
        });

        this.clientSocket.on('foundOpponent', (opponentName: string) => {
            this.opponentName = opponentName;
            this.statusGame = 'Adversaire Trouvé';
            this.foundOpponent = true;
        });
        this.clientSocket.on('gameCreatedConfirmation', (roomId: string) => {
            this.roomId = roomId;
        });

        this.clientSocket.on('updateListOfRooms', (gamesToJoin: GameRoomClient[]) => {
            this.updateAvailableRooms(gamesToJoin);
        });

        this.clientSocket.on('joiningError', (reason: string) => {
            this.errorReason.next(reason);
            this.resetErrorSubject();
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
        this.clientSocket.send('removeRoom', this.roomId);
        this.roomId = '';
        this.playerName = '';
    }

    rejectOpponent() {
        this.clientSocket.send('rejectOpponent', this.roomId);
        this.statusGame = "En Attente d'un Adversaire ...";
        this.opponentName = '';
        this.foundOpponent = false;
    }

    gameInitialization(parameters: GameParameters) {
        this.clientSocket.send('createGame', parameters);
        this.playerName = parameters.username;
        this.isCreator = true;
        this.statusGame = "En Attente d'un Adversaire ...";
    }

    joinGame(roomId: string, username: string) {
        ///
        this.clientSocket.send('roomJoin', { id: roomId, name: username });
        this.opponentName = username;
        this.roomId = roomId;
    }
    joinPage() {
        //
        this.clientSocket.send('roomLobby');
    }

    beginScrabbleGame() {
        ///
        this.clientSocket.send('startScrabbleGame', this.roomId);
    }
    private updateAvailableRooms(availableRooms: GameRoomClient[]) {
        ///
        this.availableRooms = availableRooms;
    }
    // Sprint 2
    // joinRandomRoom(playerName: string) {
    //     const random = Math.floor(Math.random() * this.availableRooms.length);
    //     const roomToJoinId = this.availableRooms[random].id;
    //     this.clientSocket.send('roomJoin', { roomToJoinId, playerName });
    // }
}
