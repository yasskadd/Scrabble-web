import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
import { Turn } from '@app/classes/turn';
import { Word } from '@app/classes/word.class';
import { LetterPlacementService, PlaceLettersReturn } from '@app/services/letter-placement.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { CommandInfo } from '@common/command-info';
import { Letter } from '@common/interfaces/letter';
import { Inject } from 'typedi';

const MAX_QUANTITY = 7;

export class Game {
    gameboard: Gameboard;

    constructor(
        player1: Player,
        player2: Player,
        public turn: Turn,
        public letterReserve: LetterReserveService,
        @Inject() private letterPlacement: LetterPlacementService,
    ) {
        this.start(player1, player2);
        this.gameboard = new Gameboard();
    }

    start(player1: Player, player2: Player): void {
        this.letterReserve.generateLetters(MAX_QUANTITY, player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, player2.rack);
        this.turn.determinePlayer(player1, player2);
        this.turn.start();
    }

    end(): void {
        this.turn.end(true);
    }

    skip(playerName: string): boolean {
        if (!this.turn.validating(playerName)) return false;
        this.turn.skipTurn();
        return true;
    }

    play(player: Player, commandInfo: CommandInfo): PlaceLettersReturn | string {
        let placeLettersReturn: PlaceLettersReturn = { hasPassed: false, gameboard: this.gameboard, invalidWords: [] as Word[] };
        const numberOfLetterPlaced = commandInfo.letters.length;
        if (this.turn.validating(player.name)) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, player);
            const newWord = validationInfo[0];
            const errorType = validationInfo[1] as string;
            if (errorType !== null) {
                this.turn.resetSkipCounter();
                return errorType as string;
            }
            placeLettersReturn = this.letterPlacement.placeLetters(newWord, commandInfo, player, this.gameboard);

            if (placeLettersReturn.hasPassed === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, player.rack);
            }

            if (player.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.resetSkipCounter();
                this.turn.end();
            }
        }
        return placeLettersReturn;
    }

    exchange(letters: string[], player: Player): Letter[] {
        if (this.turn.validating(player.name)) {
            player.rack = this.letterReserve.exchangeLetter(letters, player.rack);
            this.turn.resetSkipCounter();
            this.turn.end();
            return player.rack;
        }
        return [];
    }

    abandon(): void {
        this.end();
    }
}
