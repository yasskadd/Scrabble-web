import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { Turn } from '@app/classes/turn';
import { CommandInfo } from '@app/command-info';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Container, Inject } from 'typedi';

const MAX_QUANTITY = 7;

export class Game {
    player1: Player;
    player2: Player;
    gameboard: Gameboard;

    constructor(
        player1: Player,
        player2: Player,
        public turn: Turn,
        public letterReserve: LetterReserveService,
        @Inject() private letterPlacement: LetterPlacementService,
    ) {
        this.player1 = player1;
        this.player2 = player2;
        this.start();
        const boxMultiplierService = Container.get(BoxMultiplierService);
        this.gameboard = new Gameboard(boxMultiplierService);
    }

    start(): void {
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player2.rack);
        this.turn.determinePlayer(this.player1, this.player2);
        this.turn.start();
    }

    end(): void {
        this.turn.end(true);
        // console.log("Game has ended");
    }

    skip(playerName: string): boolean {
        if (!this.turn.validating(playerName)) return false;
        this.turn.skipTurn();
        return true;
    }

    play(playerName: string, commandInfo: CommandInfo): [boolean, Gameboard] | string {
        let gameboard: [boolean, Gameboard] = [false, this.gameboard];
        const numberOfLetterPlaced = commandInfo.lettersPlaced.length;
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, this.player1);
            const letterCoords = validationInfo[0];
            const isValid = validationInfo[1];
            if (isValid !== null) {
                this.turn.resetSkipCounter();
                this.turn.end();
                return isValid as string;
            }
            gameboard = this.letterPlacement.placeLetter(letterCoords as LetterTile[], this.player1, this.gameboard);

            if (gameboard[0] === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, this.player1.rack);
            }

            if (this.player1.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.resetSkipCounter();
                this.turn.end();
            }

            return gameboard;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, this.player2);
            const letterCoords = validationInfo[0];
            const isValid = validationInfo[1];
            if (isValid !== null) {
                this.turn.resetSkipCounter();
                this.turn.end();
                return isValid as string;
            }
            gameboard = this.letterPlacement.placeLetter(letterCoords as LetterTile[], this.player2, this.gameboard);

            if (gameboard[0] === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, this.player2.rack);
            }
            if (this.player2.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.resetSkipCounter();
                this.turn.end();
            }
            return gameboard as [boolean, Gameboard];
        }

        return gameboard;
    }

    exchange(letters: string[], playerName: string): Letter[] {
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            this.player1.rack = this.letterReserve.exchangeLetter(letters, this.player1.rack);
            this.turn.resetSkipCounter();
            this.turn.end();
            return this.player1.rack;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            this.player2.rack = this.letterReserve.exchangeLetter(letters, this.player2.rack);
            this.turn.resetSkipCounter();
            this.turn.end();
            return this.player2.rack;
        }
        return [];
    }

    abandon(): void {
        this.end();
    }
}
