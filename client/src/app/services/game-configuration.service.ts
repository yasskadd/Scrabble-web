import { Injectable } from '@angular/core';
import { GameParameters } from '@app/interfaces/game-parameters';
import { GameRoomClient } from '@app/interfaces/game-room-client';
import { SocketEvents } from '@common/constants/socket-events';
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
    timer: number;
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
        this.roomInformation = { playerName: [], roomId: '', timer: 0, isCreator: false, statusGame: '' };
        this.clientSocket.establishConnection();
        this.isRoomJoinable = new ReplaySubject<boolean>(1);
        this.isGameStarted = new ReplaySubject<boolean>(1);
        this.errorReason = new ReplaySubject<string>(1);
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.clientSocket.on(SocketEvents.JoinValidGame, (playerName: string) => {
            this.joinValidGameEvent(playerName);
        });

        this.clientSocket.on(SocketEvents.RejectByOtherPlayer, (reason: string) => {
            this.rejectByOtherPlayerEvent(reason);
        });

        this.clientSocket.on(SocketEvents.GameAboutToStart, (socketIDUserRoom: string[]) => {
            this.gameAboutToStartEvent(socketIDUserRoom);
        });

        this.clientSocket.on(SocketEvents.FoundAnOpponent, (opponentName: string) => {
            this.foundAnOpponentEvent(opponentName);
        });

        this.clientSocket.on(SocketEvents.GameCreatedConfirmation, (roomId: string) => {
            this.gameCreatedConfirmationEvent(roomId);
        });

        this.clientSocket.on(SocketEvents.UpdateRoomJoinable, (gamesToJoin: GameRoomClient[]) => {
            this.updateAvailableRooms(gamesToJoin);
        });

        this.clientSocket.on(SocketEvents.ErrorJoining, (reason: string) => {
            this.setErrorSubject(reason);
        });

        this.clientSocket.on(SocketEvents.OpponentLeave, () => {
            this.opponentLeaveEvent();
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

    setGameUnavailable() {
        this.clientSocket.send(SocketEvents.SetGameUnavailable, this.roomInformation.roomId);
    }

    setGameAvailable() {
        this.clientSocket.send(SocketEvents.SetGameAvailable, this.roomInformation.roomId);
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
        this.clientSocket.send(SocketEvents.ExitWaitingRoom, { id: this.roomInformation.roomId, name: this.roomInformation.playerName[0] });
        this.resetRoomInformation();
    }

    rejectOpponent() {
        this.clientSocket.send(SocketEvents.RejectOpponent, this.roomInformation.roomId);
        this.roomInformation.statusGame = SEARCHING_OPPONENT;
        this.roomInformation.playerName.pop();
    }

    gameInitialization(parameters: GameParameters) {
        this.roomInformation.statusGame = SEARCHING_OPPONENT;
        if (parameters.opponent !== undefined) {
            this.roomInformation.playerName[1] = parameters.opponent;
            this.roomInformation.statusGame = FOUND_OPPONENT_MESSAGE;
        }
        this.clientSocket.send(SocketEvents.CreateGame, parameters);
        this.roomInformation.timer = parameters.timer;
        this.roomInformation.playerName[0] = parameters.username;
        this.roomInformation.isCreator = true;
    }

    joinGame(roomId: string, username: string) {
        this.clientSocket.send(SocketEvents.PlayerJoinGameAvailable, { id: roomId, name: username });
        this.roomInformation.playerName[0] = username;
        this.roomInformation.roomId = roomId;
    }
    joinPage() {
        this.clientSocket.send(SocketEvents.RoomLobby);
    }

    beginScrabbleGame(opponent?: string) {
        if (opponent !== undefined) {
            this.roomInformation.playerName[1] = opponent;
        }
        this.clientSocket.send(SocketEvents.StartScrabbleGame, this.roomInformation.roomId);
    }

    resetRoomInformation() {
        this.roomInformation.roomId = '';
        this.roomInformation.playerName = [];
        this.roomInformation.statusGame = '';
        this.roomInformation.isCreator = false;
        this.availableRooms = [];
    }

    joinRandomRoom(playerName: string) {
        const random = Math.floor(Math.random() * this.availableRooms.length);
        const roomToJoinId = this.availableRooms[random].id;
        this.roomInformation.playerName[0] = playerName;
        this.roomInformation.roomId = roomToJoinId;
        this.clientSocket.send(SocketEvents.PlayerJoinGameAvailable, { id: roomToJoinId, name: playerName });
    }

    private gameCreatedConfirmationEvent(roomId: string) {
        this.roomInformation.roomId = roomId;
    }

    private opponentLeaveEvent() {
        this.roomInformation.statusGame = SEARCHING_OPPONENT;
        this.roomInformation.playerName.pop();
    }

    private foundAnOpponentEvent(opponentName: string) {
        this.roomInformation.playerName[1] = opponentName;
        this.roomInformation.statusGame = FOUND_OPPONENT_MESSAGE;
    }

    private gameAboutToStartEvent(socketIDUserRoom: string[]) {
        if (this.roomInformation.isCreator) {
            this.clientSocket.send('createScrabbleGame', {
                playerName: this.roomInformation.playerName,
                roomId: this.roomInformation.roomId,
                timer: this.roomInformation.timer,
                socketId: socketIDUserRoom,
            });
        }
        this.setIsGameStartedSubject();
    }

    private rejectByOtherPlayerEvent(reason: string) {
        this.clientSocket.send(SocketEvents.RejectByOtherPlayer, { id: this.roomInformation.roomId, name: this.roomInformation.playerName[0] });
        this.resetRoomInformation();
        this.setErrorSubject(reason);
    }

    private joinValidGameEvent(playerName: string) {
        this.roomInformation.isCreator = false;
        this.roomInformation.statusGame = WAITING_OPPONENT_CONFIRMATION;
        this.roomInformation.playerName[1] = playerName;
        this.setRoomJoinableSubject();
    }

    private updateAvailableRooms(availableRooms: GameRoomClient[]) {
        this.availableRooms = availableRooms;
    }
}
