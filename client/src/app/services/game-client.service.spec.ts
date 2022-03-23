/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SocketTestEmulator } from '@app/classes/test-classes/socket-test-emulator';
import { SocketEvents } from '@common/constants/socket-events';
import { Letter } from '@common/interfaces/letter';
import { LetterTileInterface } from '@common/interfaces/letter-tile-interface';
import { Socket } from 'socket.io-client';
import { ClientSocketService } from './communication/client-socket.service';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';
type Player = { name: string; score: number; rack: Letter[]; room: string };
type PlayInfo = { gameboard: LetterTileInterface[]; activePlayer: string };
type GameInfo = { gameboard: LetterTileInterface[]; players: Player[]; activePlayer: string };

const TIMEOUT = 15;
const PLAYER_ONE: Player = {
    name: 'Maurice',
    score: 23,
    rack: [{ value: 'b', quantity: 2, points: 1 }],
    room: '1',
};
const LETTER_RESERVE_LENGTH = 9;
const LETTER_RESERVE = [
    { value: 'c', quantity: 2, points: 1 },
    { value: 'r', quantity: 2, points: 1 },
    { value: 'p', quantity: 2, points: 1 },
    { value: 'x', quantity: 2, points: 10 },
    { value: 'w', quantity: 1, points: 7 },
];
const PLAYER_TWO: Player = {
    name: 'Paul',
    score: 327,
    rack: [
        { value: 'c', quantity: 2, points: 1 },
        { value: 'r', quantity: 2, points: 1 },
        { value: 'p', quantity: 2, points: 1 },
    ],
    room: '3',
};
const PLAYER_INFO: PlayInfo = {
    gameboard: [
        {
            coordinate: { x: 3, y: 2 },
            isOccupied: true,
            _letter: 'b',
            points: 1,
            multiplier: { type: 'LETTRE', number: 2 },
        },
    ],
    activePlayer: 'Paul',
};
const GAME_INFO: GameInfo = {
    gameboard: [
        {
            coordinate: { x: 3, y: 2 },
            isOccupied: true,
            _letter: 'e',
            points: 1,
            multiplier: { type: 'LETTRE', number: 2 },
        },
    ],
    players: [
        {
            name: 'Paul',
            score: 23,
            rack: [{ value: 'b', quantity: 2, points: 1 }],
            room: '1',
        },
        {
            name: 'Maurice',
            score: 333,
            rack: [{ value: 'c', quantity: 2, points: 1 }],
            room: '1',
        },
    ],
    activePlayer: 'Maurice',
};
const TIME = 12;

export class SocketClientServiceMock extends ClientSocketService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
describe('GameClientService', () => {
    let service: GameClientService;
    let socketEmulator: SocketTestEmulator;
    let socketServiceMock: SocketClientServiceMock;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['drawGrid', 'drawRack']);
        socketEmulator = new SocketTestEmulator();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line dot-notation
        socketServiceMock['socket'] = socketEmulator as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [
                { provide: ClientSocketService, useValue: socketServiceMock },
                { provide: GridService, useValue: gridServiceSpy },
            ],
        });
        service = TestBed.inject(GameClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update the player information', () => {
        service.playerOne = { rack: [] as Letter[] } as Player;
        socketEmulator.peerSideEmit(SocketEvents.UpdatePlayerInformation, PLAYER_ONE);
        expect(service.playerOne).toEqual(PLAYER_ONE);
    });

    it('should call updateOpponentInformationEvent', () => {
        const spy = spyOn(service, 'updateOpponentInformationEvent' as never);
        service.playerOne = PLAYER_ONE;
        socketEmulator.peerSideEmit(SocketEvents.UpdateOpponentInformation, PLAYER_TWO);
        expect(spy).toHaveBeenCalled();
    });

    it('should update the opponent information', () => {
        service.playerOne = PLAYER_ONE;
        // eslint-disable-next-line dot-notation
        service['updateOpponentInformationEvent'](PLAYER_TWO);
        expect(service.secondPlayer).toEqual(PLAYER_TWO);
    });

    it('the playerOneTurn should be false when ViewUpdate is called and it is not their turn to play', () => {
        service.playerOne = PLAYER_ONE;
        socketEmulator.peerSideEmit(SocketEvents.ViewUpdate, PLAYER_INFO);
        expect(service.playerOneTurn).not.toBeTruthy();
    });

    it('playerOneTurn should be true when ViewUpdate is called and it is their turn to play', () => {
        service.playerOne = PLAYER_TWO;
        socketEmulator.peerSideEmit(SocketEvents.ViewUpdate, PLAYER_INFO);
        expect(service.playerOneTurn).toBeTruthy();
    });

    it('updateNewGameboard should call updateGameboard', () => {
        const spy = spyOn(service, 'updateGameboard' as never);
        // eslint-disable-next-line dot-notation
        service['updateNewGameboard'](GAME_INFO.gameboard);
        expect(spy).toHaveBeenCalled();
    });

    it('opponentLeaveGameEvent should set the winning message and the isGameFinish attribute', () => {
        const winningMessageTest = "Bravo vous avez gagné la partie, l'adversaire a quitté la partie";
        // eslint-disable-next-line dot-notation
        service['opponentLeaveGameEvent']();
        expect(service.winningMessage).toEqual(winningMessageTest);
        expect(service.isGameFinish).toBeTruthy();
        expect(service.playerOneTurn).toBeFalsy();
    });

    it('skipEvent should call updateGameboard', () => {
        const spy = spyOn(service, 'updateGameboard' as never);
        service.playerOne = GAME_INFO.players[0];
        service.secondPlayer = GAME_INFO.players[1];
        // eslint-disable-next-line dot-notation
        service['skipEvent'](GAME_INFO);
        expect(service.gameboard).toEqual(GAME_INFO.gameboard);
        expect(service.playerOne).toEqual(GAME_INFO.players[0]);
        expect(service.secondPlayer).toEqual(GAME_INFO.players[1]);
        expect(service.playerOneTurn).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });

    it('updateGameboard should call drawGridArray', () => {
        service.gameboard = PLAYER_INFO.gameboard;
        const spy = spyOn(service, 'updateGameboard');
        service.updateGameboard();
        expect(spy).toHaveBeenCalled();
    });

    it('should update the gameboard information when the player skips his turn', fakeAsync(() => {
        service.playerOne = PLAYER_ONE;
        service.secondPlayer = PLAYER_TWO;
        service.gameboard = PLAYER_INFO.gameboard;
        expect(service.gameboard).not.toEqual(GAME_INFO.gameboard);
        socketEmulator.peerSideEmit(SocketEvents.Skip, GAME_INFO);
        tick(TIMEOUT);
        expect(service.gameboard).toEqual(GAME_INFO.gameboard);
        expect(service.playerOneTurn).toBeTruthy();
    }));
    it('should update the playerOneTurn to false if it is not your turn to play', fakeAsync(() => {
        service.playerOne = PLAYER_TWO;
        service.secondPlayer = PLAYER_ONE;
        service.gameboard = PLAYER_INFO.gameboard;
        expect(service.gameboard).not.toEqual(GAME_INFO.gameboard);
        socketEmulator.peerSideEmit(SocketEvents.Skip, GAME_INFO);
        tick(TIMEOUT);
        expect(service.gameboard).toEqual(GAME_INFO.gameboard);
        expect(service.playerOneTurn).not.toBeTruthy();
    }));

    it('should update the letter reserve length if SocketEvents.letterReserveUpdated event is called from the server', () => {
        socketEmulator.peerSideEmit('letterReserveUpdated', LETTER_RESERVE);
        expect(service.letterReserveLength).toEqual(LETTER_RESERVE_LENGTH);
    });

    it('should update the time when the SocketEvents.TimerClientUpdate event is called from the server', () => {
        socketEmulator.peerSideEmit(SocketEvents.TimerClientUpdate, TIME);
        expect(service.timer).toEqual(TIME);
    });

    it('should  not update the time when the SocketEvents.TimerClientUpdate event is not called from the server', () => {
        expect(service.timer).not.toEqual(TIME);
    });

    it('timerClientUpdateEvent should call isTurnFinish', () => {
        const spy = spyOn(service, 'isTurnFinish' as never);
        // eslint-disable-next-line dot-notation
        service['timerClientUpdateEvent'](TIME);
        expect(spy).toHaveBeenCalled();
    });

    it('isTurnFinish should call isTurnFinish', () => {
        const spy = spyOn(service, 'isTurnFinish' as never);
        // eslint-disable-next-line dot-notation
        service['timerClientUpdateEvent'](TIME);
        expect(spy).toHaveBeenCalled();
    });

    it('isTurnFinish() should give the value of the turnFinish variable ', () => {
        service.playerOneTurn = true;
        const spy = spyOn(service.turnFinish, 'next');
        // eslint-disable-next-line dot-notation
        service['isTurnFinish'](0);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it('isTurnFinish() should  not give the value of the turnFinish variable if is not his turn', () => {
        service.playerOneTurn = false;
        const spy = spyOn(service.turnFinish, 'next');
        // eslint-disable-next-line dot-notation
        service['isTurnFinish'](0);
        expect(spy).not.toHaveBeenCalledWith(true);
    });

    it('should  not update the letter reserve if SocketEvents.letterReserveUpdated  is not called from the server', () => {
        expect(service.letterReserveLength).not.toEqual(LETTER_RESERVE_LENGTH);
    });

    it('should set the value of isGameFinish to true when the opponent left the game ', () => {
        service.isGameFinish = false;
        socketEmulator.peerSideEmit('OpponentLeftTheGame');
        expect(service.playerOneTurn).toBeFalsy();
        expect(service.isGameFinish).toBeTruthy();
    });

    it('gameEnd event should call gameEndEvent()', () => {
        const spy = spyOn(service, 'gameEndEvent' as never);
        socketEmulator.peerSideEmit(SocketEvents.GameEnd);
        expect(spy).toHaveBeenCalled();
    });

    it('endGameEvent should call findWinnerByScore when the game is not finish already', () => {
        const spy = spyOn(service, 'findWinnerByScore' as never);
        service.isGameFinish = false;
        // eslint-disable-next-line dot-notation
        service['gameEndEvent']();
        expect(spy).toHaveBeenCalled();
    });

    it('endGameEvent should not call findWinnerByScore when the game is finish already', () => {
        const spy = spyOn(service, 'findWinnerByScore' as never);
        const messageWinner = "Bravo vous avez gagné la partie, l'adversaire a quitté la partie";
        service.winningMessage = messageWinner;
        service.isGameFinish = true;
        // eslint-disable-next-line dot-notation
        service['gameEndEvent']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should emit abandonGame to the server if the player Abandon the game', () => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocketService'], 'send');
        service.abandonGame();
        expect(spy).toHaveBeenCalledOnceWith('AbandonGame');
    });

    it('should emit quitGame to the server if the player quit the game', () => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocketService'], 'send');
        service.quitGame();
        expect(spy).toHaveBeenCalledOnceWith('quitGame');
    });

    it('should emit a message that say that the two player have the same score', () => {
        service.playerOne = PLAYER_ONE;
        service.secondPlayer = PLAYER_TWO;
        service.playerOne.score = 32;
        service.secondPlayer.score = 32;
        const messageWinner = 'Bravo aux deux joueur, vous avez le même score';

        // eslint-disable-next-line dot-notation
        service['findWinnerByScore']();
        expect(service.winningMessage).toEqual(messageWinner);
    });

    it('should emit a message that say that the first player won the game because he has a higher score than the second one', () => {
        service.playerOne = PLAYER_ONE;
        service.secondPlayer = PLAYER_TWO;
        service.playerOne.score = 33;
        service.secondPlayer.score = 32;
        const messageWinner = `Bravo ${service.playerOne.name} vous avez gagné`;

        // eslint-disable-next-line dot-notation
        service['findWinnerByScore']();
        expect(service.winningMessage).toEqual(messageWinner);
    });

    it(' getAllLetterReserve should return the length of the reserve', () => {
        // eslint-disable-next-line dot-notation
        service['getAllLetterReserve'](LETTER_RESERVE);
        expect(service.letterReserveLength).toEqual(LETTER_RESERVE_LENGTH);
    });

    it('should emit a message that say that the second player won the game because he has a higher score than the first one', () => {
        service.playerOne = PLAYER_ONE;
        service.secondPlayer = PLAYER_TWO;
        service.playerOne.score = 32;
        service.secondPlayer.score = 42;
        const messageWinner = `Bravo ${service.secondPlayer.name} vous avez gagné`;

        // eslint-disable-next-line dot-notation
        service['findWinnerByScore']();
        expect(service.winningMessage).toEqual(messageWinner);
    });

    it(' updateRack should return the rack by pushing the new letters at the end and keeping the rest of the rack intact', () => {
        const DUMMY_RACK_1 = [{ value: 'a' }, { value: '*' }, { value: 'f' }, { value: 'd' }, { value: 'e' }, { value: 's' }];
        const DUMMY_RACK_2 = [{ value: 'a' }, { value: 'b' }, { value: 'c' }, { value: 'd' }, { value: 'e' }, { value: 'f' }];
        const DUMMY_RACK_3 = [] as Letter[];

        const NEW_RACK_1 = [{ value: 'a' }, { value: 'f' }, { value: 'e' }, { value: 's' }, { value: 'd' }, { value: 'j' }];
        const NEW_RACK_2 = [{ value: 'f' }, { value: 'e' }, { value: 'b' }, { value: 'c' }, { value: 'd' }, { value: 'a' }];
        const NEW_RACK_3 = [{ value: 'a' }, { value: 'a' }, { value: 'c' }, { value: 'd' }, { value: 'e' }, { value: 'f' }];

        service.playerOne = { rack: DUMMY_RACK_1 as Letter[] } as Player;
        // eslint-disable-next-line dot-notation
        expect(service['updateRack'](NEW_RACK_1 as Letter[])).toEqual([
            { value: 'a' },
            { value: 'f' },
            { value: 'd' },
            { value: 'e' },
            { value: 's' },
            { value: 'j' },
        ] as Letter[]);
        service.playerOne.rack = DUMMY_RACK_2 as Letter[];
        // eslint-disable-next-line dot-notation
        expect(service['updateRack'](NEW_RACK_2 as Letter[])).toEqual(DUMMY_RACK_2 as Letter[]);
        service.playerOne.rack = DUMMY_RACK_3 as Letter[];
        // eslint-disable-next-line dot-notation
        expect(service['updateRack'](NEW_RACK_3 as Letter[])).toEqual(NEW_RACK_3 as Letter[]);
    });
});
