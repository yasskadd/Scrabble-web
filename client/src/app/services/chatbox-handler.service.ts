import { Injectable } from '@angular/core';
import { ChatboxMessage } from '@app/interfaces/chatbox-message';
import { Letter } from '@common/letter';
import { SocketEvents } from '@common/socket-events';
import { ClientSocketService } from './client-socket.service';
import { CommandHandlerService } from './command-handler.service';
import { GameClientService } from './game-client.service';
import { GameConfigurationService } from './game-configuration.service';

const VALID_COMMAND_REGEX_STRING =
    // eslint-disable-next-line max-len
    '^!r(é|e)serve$|^!aide$|^!placer [a-o][0-9]{1,2}(v|h){0,1} [a-zA-Z]$|^!placer [a-o][0-9]{1,2}(v|h) ([a-zA-Z]){1,7}$|^!(é|e)changer ([a-z]|[*]){1,7}$|^!passer$';
const VALID_COMMAND_REGEX = new RegExp(VALID_COMMAND_REGEX_STRING);
const IS_COMMAND_REGEX_STRING = '^!';
const IS_COMMAND_REGEX = new RegExp(IS_COMMAND_REGEX_STRING);

@Injectable({
    providedIn: 'root',
})
export class ChatboxHandlerService {
    private static readonly syntaxRegexString = '^!r(é|e)serve|^!aide|^!placer|^!(é|e)changer|^!passer';
    messages: ChatboxMessage[];
    private readonly validSyntaxRegex = RegExp(ChatboxHandlerService.syntaxRegexString);

    constructor(
        private clientSocket: ClientSocketService,
        private gameConfiguration: GameConfigurationService,
        private gameClient: GameClientService,
        private commandHandler: CommandHandlerService,
    ) {
        this.messages = [];
        this.configureBaseSocketFeatures();
    }

    submitMessage(userInput: string): void {
        if (userInput !== '') {
            this.addMessage(this.configureUserMessage(userInput));
            if (this.isCommand(userInput)) {
                if (this.validCommand(userInput)) {
                    const commandValid = userInput.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    this.commandHandler.sendCommand(commandValid);
                }
            } else {
                this.sendMessage(userInput);
            }
        }
    }

    endGameMessage(): void {
        const myLetterLeft = this.getAllLetter(this.gameClient.playerOne.rack as never);
        const opponentLetterLeft = this.getAllLetter(this.gameClient.secondPlayer.rack as never);
        this.messages.push({ type: 'system-message', data: 'Fin de la partie : lettres restantes' });
        this.messages.push({ type: 'system-message', data: `${this.gameClient.playerOne.name} : ${myLetterLeft}` });
        this.messages.push({ type: 'system-message', data: `${this.gameClient.secondPlayer.name} : ${opponentLetterLeft}` });
    }

    resetMessage() {
        this.messages = [];
    }

    private configureBaseSocketFeatures(): void {
        this.clientSocket.on(SocketEvents.GameMessage, (broadcastMessage: string) => {
            this.messages.push({ type: 'opponent-user', data: `${this.gameConfiguration.roomInformation.playerName[1]} : ${broadcastMessage}` });
        });
        this.clientSocket.on(SocketEvents.ImpossibleCommandError, (error: string) => {
            this.addMessage(this.configureImpossibleCommandError(error));
        });
        this.clientSocket.on(SocketEvents.UserDisconnect, () => {
            this.addDisconnect();
        });
        this.clientSocket.on(SocketEvents.GameEnd, () => {
            this.endGameMessage();
        });

        this.clientSocket.on(SocketEvents.AllReserveLetters, (letterReserveUpdated: Letter[]) => {
            this.configureReserveLetterCommand(letterReserveUpdated);
        });
    }

    private sendMessage(message: string): void {
        this.clientSocket.send(SocketEvents.SendMessage, { roomId: this.gameConfiguration.roomInformation.roomId, message });
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
        if (this.gameClient.playerOneTurn || this.isReserveCommand(userCommand)) {
            if (this.validSyntax(userCommand)) {
                if (this.validCommandParameters(userCommand)) {
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

    private isReserveCommand(userInput: string): boolean {
        const validReserveCommand = '^!r(é|e)serve$';
        const validReserveCommandRegex = new RegExp(validReserveCommand);
        return validReserveCommandRegex.test(userInput);
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
        return { type: 'system-message', data: '[Erreur] Erreur de syntaxe' };
    }

    private configureInvalidError(): ChatboxMessage {
        return { type: 'system-message', data: '[Erreur] La commande saisie est invalide' };
    }

    private configureImpossibleCommandError(error: string): ChatboxMessage {
        return { type: 'system-message', data: `[Erreur] ${error}` };
    }

    private getAllLetter(letters: Letter[]): string {
        let letterString = '';
        letters.forEach((letter) => {
            letterString = letterString + letter.value;
        });
        return letterString;
    }

    private configureReserveLetterCommand(letterReserve: Letter[]): void {
        letterReserve.forEach((letter) => {
            this.messages.push({ type: 'system-message', data: `${letter.value}: ${letter.quantity}` });
        });
    }
}
