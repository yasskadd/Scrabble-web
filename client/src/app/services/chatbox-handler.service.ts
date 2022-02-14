import { Injectable } from '@angular/core';
import { ChatboxMessage } from '@app/classes/chatbox-message';
import { Coordinate } from '@common/coordinate';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { GameClientService } from './game-client.service';
import { GameConfigurationService } from './game-configuration.service';

// const VALID_SYNTAX_REGEX_STRING = '^!aide|^!placer|^!(é|e)changer|^!passer';
// const VALID_SYNTAX_REGEX = new RegExp(VALID_SYNTAX_REGEX_STRING);
const VALID_COMMAND_REGEX_STRING =
    '^!aide$|^!placer [a-o][0-9]{1,2}(v|h){0,1} [a-zA-Z]$|^!placer [a-o][0-9]{1,2}(v|h) ([a-zA-Z]){1,7}$|^!(é|e)changer ([a-z]|[*]){1,7}$|^!passer$';
const VALID_COMMAND_REGEX = new RegExp(VALID_COMMAND_REGEX_STRING);
const IS_COMMAND_REGEX_STRING = '^!';
const IS_COMMAND_REGEX = new RegExp(IS_COMMAND_REGEX_STRING);

@Injectable({
    providedIn: 'root',
})
export class ChatboxHandlerService {
    private static readonly syntaxRegexString = '^!aide|^!placer|^!(é|e)changer|^!passer';
    messages: ChatboxMessage[];
    private readonly validSyntaxRegex = RegExp(ChatboxHandlerService.syntaxRegexString);

    constructor(
        private clientSocket: ClientSocketService,
        private gameConfiguration: GameConfigurationService,
        private gameClient: GameClientService,
    ) {
        this.messages = [];
        this.configureBaseSocketFeatures();
    }

    submitMessage(userInput: string): void {
        if (userInput !== '') {
            if (this.isCommand(userInput)) {
                if (this.validCommand(userInput)) {
                    const commandValid = userInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    this.sendCommand(commandValid);
                }
            } else {
                this.addMessage(this.configureUserMessage(userInput));
                this.sendMessage(userInput);
            }
        }
    }

    endGameMessage(): void {
        const letterReserve = this.getAllLetterReserve(this.gameClient.letterReserve);
        const myLetterLeft = this.getAllLetter(this.gameClient.playerOne.rack as never);
        const opponentLetterLeft = this.getAllLetter(this.gameClient.secondPlayer.rack as never);
        this.messages.push({ type: 'system-message', data: `Fin de la partie : ${letterReserve}` });
        this.messages.push({ type: 'system-message', data: `${this.gameClient.playerOne.name} : ${myLetterLeft}` });
        this.messages.push({ type: 'system-message', data: `${this.gameClient.secondPlayer.name} : ${opponentLetterLeft}` });
    }

    private configureBaseSocketFeatures(): void {
        this.clientSocket.on('gameMessage', (broadcastMessage: string) => {
            this.messages.push({ type: 'opponent-user', data: `${this.gameConfiguration.roomInformation.playerName[1]} : ${broadcastMessage}` });
        });
        this.clientSocket.on('impossibleCommandError', (error: string) => {
            this.addMessage(this.configureImpossibleCommandError(error));
        });
        this.clientSocket.on('user disconnect', () => {
            this.addDisconnect();
        });
        this.clientSocket.on('endGame', () => {
            this.endGameMessage();
        });
    }

    private sendMessage(message: string): void {
        this.clientSocket.send(SocketEvents.SendMessage, { roomId: this.gameConfiguration.roomInformation.roomId, message });
    }

    private sendCommand(command: string): void {
        const splitCommand = this.splitCommand(command);
        const commandType = this.getCommandType(splitCommand);
        switch (commandType) {
            case '!placer': {
                this.sendCommandPlacer(splitCommand);
                break;
            }
            case '!echanger': {
                this.sendCommandEchanger(splitCommand);
                break;
            }
            case '!passer': {
                this.clientSocket.send(SocketEvents.Skip);
                break;
            }
            // No default
        }
    }

    private addMessage(message: ChatboxMessage): void {
        this.messages.push(message);
    }

    private addDisconnect() {
        this.messages.push({ type: 'system-message', data: `${this.gameConfiguration.roomInformation.playerName[1]} a quitté le jeu` });
    }

    private isCommand(userInput: string): boolean {
        return IS_COMMAND_REGEX.test(userInput);
    }

    private validCommand(userCommand: string): boolean {
        if (this.gameClient.playerOneTurn) {
            if (this.validSyntax(userCommand)) {
                if (this.validCommandParameters(userCommand)) {
                    this.addMessage(this.configureUserMessage(userCommand));
                    return true;
                } else {
                    this.addMessage(this.configureInvalidError());
                }
            } else {
                this.addMessage(this.configureSyntaxError());
            }
        } else {
            this.messages.push({ type: 'system-message', data: "Ce n'est pas votre tour" });
        }
        return false;
    }

    private validSyntax(userInput: string): boolean {
        return this.validSyntaxRegex.test(userInput);
    }

    private validCommandParameters(userInput: string): boolean {
        return VALID_COMMAND_REGEX.test(userInput);
    }

    private configureUserMessage(userInput: string): ChatboxMessage {
        return { type: 'current-user', data: `Toi : ${userInput}` };
    }

    private configureSyntaxError(): ChatboxMessage {
        return { type: 'system-message', data: '[Erreur] Erreur de synthese' };
    }

    private configureInvalidError(): ChatboxMessage {
        return { type: 'system-message', data: '[Erreur] La commande saisie est invalide' };
    }

    private sendCommandPlacer(command: string[]) {
        const coordsAndDirection = this.getCoordsAndDirection(command);
        const commandInformation = {
            firstCoordinate: coordsAndDirection[0],
            direction: coordsAndDirection[1],
            lettersPlaced: this.getLetters(command, 2),
        };
        this.clientSocket.send(SocketEvents.Play, commandInformation);
    }

    private sendCommandEchanger(command: string[]) {
        this.clientSocket.send(SocketEvents.Exchange, this.getLetters(command, 1));
    }

    private splitCommand(command: string) {
        return command.split(' ');
    }

    private isDigit(information: string) {
        return information >= '0' && information <= '9';
    }
    private getCommandType(stringArr: string[]) {
        return stringArr[0];
    }
    private getCoordsAndDirection(stringArr: string[]) {
        const placementArray = stringArr[1].split('');
        // TODO : Number magic to remove
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.isDigit(placementArray[2]) && placementArray[3] != null) {
            const coordinateX = +(placementArray[1] + placementArray[2]);
            return [{ x: coordinateX - 1, y: parseInt(placementArray[0], 36) - 10 } as Coordinate, placementArray[3] as string];
        } else if (this.isDigit(placementArray[2])) {
            const coordinateX = +(placementArray[1] + placementArray[2]);
            return [{ x: coordinateX - 1, y: parseInt(placementArray[0], 36) - 10 } as Coordinate, '' as string];
        } else if (placementArray[2] == null) {
            const coordinateX = +placementArray[1];
            return [{ x: coordinateX - 1, y: parseInt(placementArray[0], 36) - 10 } as Coordinate, '' as string];
        }
        return [{ x: parseInt(placementArray[1], 10) - 1, y: parseInt(placementArray[0], 36) - 10 } as Coordinate, placementArray[2] as string];
    }

    private getLetters(stringArr: string[], position: number) {
        return stringArr[position].split('');
    }

    // TODO : come back to test and code

    private configureImpossibleCommandError(error: string): ChatboxMessage {
        return { type: 'system-message', data: error };
    }

    private getAllLetter(letters: Letter[]): string {
        let letterString = '';
        letters?.forEach((letter) => {
            letterString = letterString + letter.value;
        });
        return letterString;
    }

    private getAllLetterReserve(letters: Letter[]): string {
        let letterString = '';
        letters?.forEach((letter) => {
            for (let i = 1; i <= letter.quantity; i++) {
                letterString = letterString + letter.value;
            }
        });
        return letterString;
    }
}
