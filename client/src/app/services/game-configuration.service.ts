import { Injectable } from '@angular/core';
import { GameParameters } from '@app/classes/game-parameters';
import { GameRoomClient } from '@app/classes/game-room-client';
import { SocketEvents } from '@common/socket-events';
import { ReplaySubject } from 'rxjs';
import { ClientSocketService } from './client-socket.service';

const FOUND_OPPONENT_MESSAGE = 'Adversaire Trouvé';
const SEARCHING_OPPONENT = "En Attente d'un Adversaire ...";
const WAITING_OPPONENT_CONFIRMATION = "En Attente de la confirmation de L'adversaire";

interface RoomInformation {
    playerName: string[];
    roomId: string;
    isCreator: boolean;
    statusGame: string;
}
@Injectable({
    providedIn: 'root',
})
export class GameConfigurationService {
    roomInformation: RoomInformation;
    availableRooms: GameRoomClient[];
    isGameStarted: ReplaySubject<boolean>;
    isRoomJoinable: ReplaySubject<boolean>;
    errorReason: ReplaySubject<string>;

    constructor(private clientSocket: ClientSocketService) {
        this.availableRooms = [];
        this.clientSocket.establishConnection();
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
        this.isGameStarted = new ReplaySubject<boolean>(1);
        this.errorReason = new ReplaySubject<string>(1);
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.clientSocket.on(SocketEvents.JoinValidGame, (playerName: string) => {
            this.roomInformation.isCreator = false;
            this.roomInformation.statusGame = WAITING_OPPONENT_CONFIRMATION;
            this.roomInformation.playerName[1] = playerName;
            this.setRoomJoinableSubject();
        });

        this.clientSocket.on(SocketEvents.RejectByOtherPlayer, (reason: string) => {
            this.clientSocket.send(SocketEvents.RejectByOtherPlayer, { id: this.roomInformation.roomId, name: this.roomInformation.playerName[0] });
            this.resetRoomInformation();
            this.setErrorSubject(reason);
        });

        this.clientSocket.on(SocketEvents.GameAboutToStart, () => {
            this.setIsGameStartedSubject();
        });

        this.clientSocket.on(SocketEvents.FoundAnOpponent, (opponentName: string) => {
            this.roomInformation.playerName[1] = opponentName;
            this.roomInformation.statusGame = FOUND_OPPONENT_MESSAGE;
        });
        this.clientSocket.on(SocketEvents.GameCreatedConfirmation, (roomId: string) => {
            this.roomInformation.roomId = roomId;
        });

        this.clientSocket.on(SocketEvents.UpdateRoomJoinable, (gamesToJoin: GameRoomClient[]) => {
            this.updateAvailableRooms(gamesToJoin);
        });

        this.clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            this.setErrorSubject(reason);
        });
        this.clientSocket.on('OpponentLeave', () => {
            this.roomInformation.statusGame = SEARCHING_OPPONENT;
            this.roomInformation.playerName.pop();
        });
    }

    setIsGameStartedSubject() {
        this.isGameStarted.next(true);
        this.isGameStarted = new ReplaySubject<boolean>(1);
    }
    setRoomJoinableSubject() {
        this.isRoomJoinable.next(true);
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
    }
    setErrorSubject(reason: string) {
        this.errorReason.next(reason);
        this.errorReason = new ReplaySubject<string>(1);
    }

    removeRoom() {
        if (this.roomInformation.playerName[1]) {
            this.rejectOpponent();
        }
        this.clientSocket.send(SocketEvents.RemoveRoom, this.roomInformation.roomId);
        this.roomInformation.roomId = '';
        this.roomInformation.playerName.pop();
    }

    exitWaitingRoom() {
        this.clientSocket.send('exitWaitingRoom', { id: this.roomInformation.roomId, name: this.roomInformation.playerName[0] });
        this.resetRoomInformation();
    }

    rejectOpponent() {
        this.clientSocket.send(SocketEvents.RejectOpponent, this.roomInformation.roomId);
        this.roomInformation.statusGame = SEARCHING_OPPONENT;
        this.roomInformation.playerName.pop();
    }

    gameInitialization(parameters: GameParameters) {
        this.clientSocket.send(SocketEvents.CreateGame, parameters);
        this.roomInformation.playerName[0] = parameters.username;
        this.roomInformation.isCreator = true;
        this.roomInformation.statusGame = SEARCHING_OPPONENT;
    }

    joinGame(roomId: string, username: string) {
        this.clientSocket.send(SocketEvents.PlayerJoinGameAvailable, { id: roomId, name: username });
        this.roomInformation.playerName[0] = username;
        this.roomInformation.roomId = roomId;
    }
    joinPage() {
        this.clientSocket.send(SocketEvents.RoomLobby);
    }

    beginScrabbleGame() {
        this.clientSocket.send(SocketEvents.StartScrabbleGame, this.roomInformation.roomId);
    }
    private updateAvailableRooms(availableRooms: GameRoomClient[]) {
        this.availableRooms = availableRooms;
    }

    private resetRoomInformation() {
        this.roomInformation.roomId = '';
        this.roomInformation.playerName = [];
        this.roomInformation.statusGame = '';
        this.roomInformation.isCreator = false;
    }
    // Sprint 2
    // joinRandomRoom(playerName: string) {
    //     const random = Math.floor(Math.random() * this.availableRooms.length);
    //     const roomToJoinId = this.availableRooms[random].id;
    //     this.clientSocket.send('roomJoin', { roomToJoinId, playerName });
    // }
}
