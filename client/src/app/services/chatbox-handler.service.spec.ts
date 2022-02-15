/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { SocketTestEmulator } from '@app/classes/test-classes/socket-test-emulator';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { Socket } from 'socket.io-client';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { ClientSocketService } from './client-socket.service';
import { GameClientService } from './game-client.service';
import { GameConfigurationService } from './game-configuration.service';

type Player = { name: string; score: number; rack?: Letter[]; room: string };
interface RoomInformation {
    playerName: string[];
    roomId: string;
    isCreator: boolean;
    statusGame: string;
}
const ROOM_INFORMATION: RoomInformation = {
    playerName: ['Vincent', 'RICHARD'],
    roomId: '1',
    isCreator: true,
    statusGame: 'En attente du joueur',
};

const PLAYER1_INFORMATION: Player = {
    name: 'Vincent',
    score: 70,
    rack: [
        { value: 'c', quantity: 2, points: 1 },
        { value: 'r', quantity: 2, points: 1 },
        { value: 'p', quantity: 2, points: 1 },
    ],
    room: '1',
};
const SECOND_PLAYER_INFORMATION: Player = {
    name: 'Vincent',
    score: 70,
    rack: [
        { value: 'w', quantity: 2, points: 1 },
        { value: 'k', quantity: 2, points: 1 },
        { value: 't', quantity: 2, points: 1 },
    ],
    room: '1',
};
export class SocketClientServiceMock extends ClientSocketService {
    // Reason : connect shouldn't actually connect
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
// { provide: ClientSocketService, useValue: SocketClientServiceMock }
describe('ChatboxHandlerService', () => {
    let service: ChatboxHandlerService;
    let socketServiceMock: SocketClientServiceMock;
    let socketEmulator: SocketTestEmulator;
    let gameConfigurationServiceSpy: jasmine.SpyObj<GameConfigurationService>;
    let gameClientServiceSpy: jasmine.SpyObj<GameClientService>;
    beforeEach(() => {
        gameConfigurationServiceSpy = jasmine.createSpyObj('GameConfigurationService', ['removeRoom', 'rejectOpponent', 'beginScrabbleGame'], {
            roomInformation: ROOM_INFORMATION,
        });
        gameClientServiceSpy = jasmine.createSpyObj('GameClientService', [], {
            playerOne: PLAYER1_INFORMATION,
            secondPlayer: SECOND_PLAYER_INFORMATION,
        });
        socketEmulator = new SocketTestEmulator();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketEmulator as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [
                { provide: ClientSocketService, useValue: socketServiceMock },
                { provide: GameConfigurationService, useValue: gameConfigurationServiceSpy },
                { provide: GameClientService, useValue: gameClientServiceSpy },
            ],
        });
        // socketServiceMock = new SocketClientServiceMock();
        service = TestBed.inject(ChatboxHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("validSyntax() should validate the syntax of the 'aide' command", () => {
        const VALID_SYNTAX = '!aide';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validSyntax'](VALID_SYNTAX)).toBeTruthy();
    });

    it("validSyntax() should validate the syntax of the 'placer' command", () => {
        const VALID_SYNTAX = '!placer';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validSyntax'](VALID_SYNTAX)).toBeTruthy();
    });

    it("validSyntax() should validate the syntax of the 'échanger' command", () => {
        const VALID_SYNTAX_1 = '!échanger';
        const VALID_SYNTAX_2 = '!echanger';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validSyntax'](VALID_SYNTAX_1)).toBeTruthy();

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validSyntax'](VALID_SYNTAX_2)).toBeTruthy();
    });

    it("validSyntax() should validate the syntax of the 'passer' command", () => {
        const VALID_SYNTAX = '!passer ';
        // eslint-disable-next-line dot-notation
        expect(service['validSyntax'](VALID_SYNTAX)).toBeTruthy();
    });

    it("validCommandParameters() shouldn't validate invalid command syntax", () => {
        const INVALID_SYNTAX = '!/d!azLaRuche! ';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](INVALID_SYNTAX)).toBeFalsy();
    });

    it("validCommandParameters() should validate the command parameters of the 'aide' command", () => {
        const VALID_COMMAND_PARAMS = '!aide';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](VALID_COMMAND_PARAMS)).toBeTruthy();
    });

    it("validCommandParameters() should validate the command parameters of the 'passer' command", () => {
        const VALID_COMMAND_PARAMS = '!passer';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](VALID_COMMAND_PARAMS)).toBeTruthy();
    });

    it("validCommandParameters() should validate the command parameters of the 'placer' command", () => {
        const VALID_COMMAND = '!placer a5v acd';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](VALID_COMMAND)).toBeTruthy();
    });

    it("validCommandParameters() should validate the command parameters of the 'échanger' command", () => {
        const VALID_COMMAND_PARAMS_1 = '!échanger avd';
        const VALID_COMMAND_PARAMS_2 = '!echanger avd';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](VALID_COMMAND_PARAMS_1)).toBeTruthy();
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](VALID_COMMAND_PARAMS_2)).toBeTruthy();
    });

    it("validCommandParameters() shouldn't validate invalid command parameters", () => {
        const INVALID_COMMAND_PARAMS_1 = '!echanger 93248';
        const INVALID_COMMAND_PARAMS_2 = '!placer 251d Monsieur420Robert';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](INVALID_COMMAND_PARAMS_1)).toBeFalsy();
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommandParameters'](INVALID_COMMAND_PARAMS_2)).toBeFalsy();
    });

    it('isCommand() should recognize a command structure', () => {
        const IS_COMMAND = '!aide';
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['isCommand'](IS_COMMAND)).toBeTruthy();
    });

    it("isCommand() should recognize when it's not a command", () => {
        const NOT_A_COMMAND = 'aide moi Robert';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['isCommand'](NOT_A_COMMAND)).toBeFalsy();
    });

    it('validCommand() should add command to the displayed messages and return true on a valid command', () => {
        const VALID_COMMAND = '!aide';
        gameClientServiceSpy.playerOneTurn = true;
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommand'](VALID_COMMAND)).toBeTruthy();

        const EXPECTED_COMMAND_MESSAGE = { type: 'current-user', data: `Toi : ${VALID_COMMAND}` };
        expect(service.messages.pop()).toEqual(EXPECTED_COMMAND_MESSAGE);
    });

    it('validCommand() should add the corresponding error to the displayed messages and return false on an invalid syntax', () => {
        const INVALID_SYNTAX = '!abcdefg';
        gameClientServiceSpy.playerOneTurn = true;
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommand'](INVALID_SYNTAX)).toBeFalsy();

        const EXPECTED_SYNTAX_ERROR = { type: 'system-message', data: '[Erreur] Erreur de syntaxe' };
        expect(service.messages.pop()).toEqual(EXPECTED_SYNTAX_ERROR);
    });

    it('validCommand() should add the corresponding error to the displayed messages and return false when it is not the player turn', () => {
        const commandTest = '!passer';
        gameClientServiceSpy.playerOneTurn = false;
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommand'](commandTest)).toBeFalsy();

        const EXPECTED_SYNTAX_ERROR = { type: 'system-message', data: "Ce n'est pas votre tour" };
        expect(service.messages.pop()).toEqual(EXPECTED_SYNTAX_ERROR);
    });

    it('validCommand() should add the corresponding error to the displayed messages and return false on an invalid command parameters', () => {
        const INVALID_COMMAND_PARAMS = '!placer Laruche enStage';
        gameClientServiceSpy.playerOneTurn = true;
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['validCommand'](INVALID_COMMAND_PARAMS)).toBeFalsy();

        const EXPECTED_MESSAGE_FORMATED = { type: 'system-message', data: '[Erreur] La commande saisie est invalide' };
        expect(service.messages.pop()).toEqual(EXPECTED_MESSAGE_FORMATED);
    });

    it('configureSyntaxError() should return the valid ErrorMessage', () => {
        const EXPECTED_SYNTAX_ERROR = { type: 'system-message', data: '[Erreur] Erreur de syntaxe' };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['configureSyntaxError']()).toEqual(EXPECTED_SYNTAX_ERROR);
    });

    it('configureInvalidError() should return the valid ErrorMessage', () => {
        const EXPECTED_INVALID_ERROR = { type: 'system-message', data: '[Erreur] La commande saisie est invalide' };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['configureInvalidError']()).toEqual(EXPECTED_INVALID_ERROR);
    });

    it('configureUserMessage() should return the valid message configuration', () => {
        const userInput = 'Bonjour adversaire';
        const EXPECTED_USER_MESSAGE = { type: 'current-user', data: `Toi : ${userInput}` };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['configureUserMessage'](userInput)).toEqual(EXPECTED_USER_MESSAGE);
    });

    it('addMessage() should add message to the messages Array', () => {
        const EXPECTED_USER_MESSAGE = { type: 'current-user', data: 'Bonjour Monsieur' };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['addMessage'](EXPECTED_USER_MESSAGE);
        expect(service.messages.pop()).toEqual(EXPECTED_USER_MESSAGE);
    });

    it('addDisconnect() should add a system-message to the messages Array saying that the other player disconnected from the room', () => {
        const EXPECTED_USER_DISCONNECTED_MESSAGE = { type: 'system-message', data: 'RICHARD a quitté le jeu' };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['addDisconnect']();
        expect(service.messages.pop()).toEqual(EXPECTED_USER_DISCONNECTED_MESSAGE);
    });

    it('submitMessage() should call sendCommand() if the command is valid ', () => {
        gameClientServiceSpy.playerOneTurn = true;
        const spyOnSendCommand = spyOn<ChatboxHandlerService>(service, 'sendCommand' as never);
        const VALID_COMMAND = '!passer';

        service.submitMessage(VALID_COMMAND);
        expect(spyOnSendCommand).toHaveBeenCalled();
    });

    it('submitMessage() should call sendMessage() if the command is valid ', () => {
        const spyOnSendMessage = spyOn<ChatboxHandlerService>(service, 'sendMessage' as never);
        const MESSAGE = 'Bonjour monsieur Robert';

        service.submitMessage(MESSAGE);
        expect(spyOnSendMessage).toHaveBeenCalled();
    });

    it("submitMessage() shouldn't send anything", () => {
        const spyOnSendCommand = spyOn<ChatboxHandlerService>(service, 'sendCommand' as never);
        const spyOnSendMessage = spyOn<ChatboxHandlerService>(service, 'sendMessage' as never);

        const INVALID_COMMAND = '!|!|PokemonMasterXX20|!|';

        service.submitMessage(INVALID_COMMAND);
        expect(spyOnSendCommand).not.toHaveBeenCalled();
        expect(spyOnSendMessage).not.toHaveBeenCalled();
    });

    it('sendMessage() send a message to the server with a message event', () => {
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        const spyOnSocket = spyOn(service['clientSocket'], 'send');
        const EVENT_MESSAGE = 'message';
        const TEST_MESSAGE = 'Bonjour mon ami';
        const TEST_MESSAGE_OBJECT = { roomId: '1', message: 'Bonjour mon ami' };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['sendMessage'](TEST_MESSAGE);
        expect(spyOnSocket).toHaveBeenCalledWith(EVENT_MESSAGE, TEST_MESSAGE_OBJECT);
    });

    it('sendCommand() send a command to the server with a message event', () => {
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocket'], 'send');
        const TEST_COMMAND = '!echanger avd';
        const exchangeLetters = ['a', 'v', 'd'];
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['sendCommand'](TEST_COMMAND);
        expect(spy).toHaveBeenCalledWith(SocketEvents.Exchange, exchangeLetters);
    });

    it('sendCommand() should call sendCommandPlacer if the command valid is to place a word on the board', () => {
        const spy = spyOn(service, 'sendCommandPlacer' as never);
        const TEST_COMMAND = '!placer e3v bonjour';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['sendCommand'](TEST_COMMAND);
        expect(spy).toHaveBeenCalled();
    });
    it('sendCommand() should call emit an event to the server if the command valid is to skip the turn', () => {
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocket'], 'send');
        const TEST_COMMAND = '!passer';

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['sendCommand'](TEST_COMMAND);
        expect(spy).toHaveBeenCalledWith(SocketEvents.Skip);
    });
    it('sendCommandPlacer() should send to the server all the information of the command in an object', () => {
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocket'], 'send');
        const commandTest = '!placer e3v bonjour';
        const commandInformation = {
            firstCoordinate: { x: 2, y: 4 },
            direction: 'v',
            lettersPlaced: ['b', 'o', 'n', 'j', 'o', 'u', 'r'],
        };
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['sendCommand'](commandTest);
        expect(spy).toHaveBeenCalledWith(SocketEvents.Play, commandInformation);
    });
    it('configureBaseSocketFeatures() should add the listeners to the socket', () => {
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        const spy = spyOn(service['clientSocket'], 'on');

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        service['configureBaseSocketFeatures']();
        expect(spy).toHaveBeenCalled();
    });

    it('getAllLetter should return a list off all the letters with the string char of them', () => {
        const rackLetter = 'crp';
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['getAllLetter'](gameClientServiceSpy.playerOne.rack as never)).toEqual(rackLetter);
    });

    it('should return the coordination with a direction if want to place a word with more than one letter', () => {
        const commandArray = ['!placer', 'o2v', 'place'];
        const placementInfo = [{ x: 1, y: 14 }, 'v'];
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['getCoordsAndDirection'](commandArray)).toEqual(placementInfo);
    });

    it('should emit 3 messages to show in the chatBox when the game is finish', () => {
        const message1 = { type: 'system-message', data: 'Fin de la partie : lettres restantes' };
        const message2 = { type: 'system-message', data: `${gameClientServiceSpy.playerOne.name} : crp` };
        const message3 = { type: 'system-message', data: `${gameClientServiceSpy.secondPlayer.name} : wkt` };

        service.endGameMessage();
        expect(service.messages.pop()).toEqual(message3);
        expect(service.messages.pop()).toEqual(message2);
        expect(service.messages.pop()).toEqual(message1);
    });
    it('should return the coordination with a direction if the y factor is two digit', () => {
        const commandArray = ['!placer', 'o12v', 'place'];
        const placementInfo = [{ x: 11, y: 14 }, 'v'];
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['getCoordsAndDirection'](commandArray)).toEqual(placementInfo);
    });
    it('should return the coordination with no direction if one letter wants to be placed', () => {
        const commandArray = ['!placer', 'o12', 'e'];
        const placementInfo = [{ x: 11, y: 14 }, ''];
        const commandArray2 = ['!placer', 'o1', 'e'];
        const placementInfo2 = [{ x: 0, y: 14 }, ''];
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['getCoordsAndDirection'](commandArray)).toEqual(placementInfo);
        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['getCoordsAndDirection'](commandArray2)).toEqual(placementInfo2);
    });

    it('should add a message emit from the server when gameMessage event is emit', () => {
        const messageReceive = '!passer';
        const messageShow = { type: 'opponent-user', data: `${gameConfigurationServiceSpy.roomInformation.playerName[1]} : ${messageReceive}` };
        socketEmulator.peerSideEmit(SocketEvents.GameMessage, messageReceive);
        expect(service.messages.pop()).toEqual(messageShow);
    });

    it('should called the configureImpossibleCommandError if the server emit the Event', () => {
        const messageError = 'impossible de placer la lettre';
        const spy = spyOn(service, 'configureImpossibleCommandError' as never);
        socketEmulator.peerSideEmit(SocketEvents.impossibleCommandError, messageError);
        expect(spy).toHaveBeenCalledWith(messageError as never);
    });
    it('should called the addDisconnect  method if the server emit the Event', () => {
        const spy = spyOn(service, 'addDisconnect' as never);
        socketEmulator.peerSideEmit('user disconnect');
        expect(spy).toHaveBeenCalled();
    });

    it('should called the endGame Message method if the server emit the Event', () => {
        const spy = spyOn(service, 'endGameMessage' as never);
        socketEmulator.peerSideEmit('endGame');
        expect(spy).toHaveBeenCalled();
    });

    it('configureImpossibleCommandError() should return the valid error configuration', () => {
        const errorMessage = 'invalid placement';
        const EXPECTED_IMPOSSIBLE_ERROR = { type: 'system-message', data: `[Erreur] ${errorMessage}` };

        // Reason : testing a private method
        // eslint-disable-next-line dot-notation
        expect(service['configureImpossibleCommandError'](errorMessage)).toEqual(EXPECTED_IMPOSSIBLE_ERROR);
    });

    it('SubmitMessage should send nothing if the user input is empty', () => {
        const spy = spyOn(service, 'sendCommand' as never);
        const spy2 = spyOn(service, 'addMessage' as never);
        service.submitMessage('');
        expect(spy).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
    });
});
