import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player.class';
import { CommandInfo } from '@app/command-info';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { LetterPlacementService } from '@app/services/letter-placement.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Letter } from '@common/letter';
import { Container } from 'typedi';
import { GameboardCoordinate } from './gameboard-coordinate.class';
import { Turn } from './turn';

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
        private letterPlacement: LetterPlacementService,
    ) {
        this.player1 = player1;
        this.player2 = player2;
        this.start();
        const boxMultiplierService = Container.get(BoxMultiplierService);
        this.gameboard = new Gameboard(boxMultiplierService);
    }

    /**
     * Start a game.
     */
    start(): void {
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player2.rack);
        this.turn.determinePlayer(this.player1, this.player2);
        this.turn.start();
    }

    /**
     * End a game.
     */
    end(): void {
        this.turn.end(true);
        // console.log("Game has ended");
    }

    /**
     * Skip a turn.
     */
    skip(playerName: string): boolean {
        if (!this.turn.validating(playerName)) return false;
        this.turn.skipTurn();
        return true;
    }

    /**
     * Play the turn by placing letters.
     *
     * @param playerName : The active player who will play.
     */
    play(playerName: string, commandInfo: CommandInfo): [boolean, Gameboard] | string {
        let gameboard: [boolean, Gameboard] = [false, this.gameboard];
        const numberOfLetterPlaced = commandInfo.lettersPlaced.length;
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, this.player1);
            const letterCoords = validationInfo[0];
            const isValid = validationInfo[1];
            if (isValid !== null) {
                return isValid as string;
            }
            gameboard = this.letterPlacement.placeLetter(letterCoords as GameboardCoordinate[], this.player1, this.gameboard);
            // TODO: test to do
            if (gameboard[0] === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, this.player1.rack);
            }

            if (this.player1.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.end();
            }

            return gameboard;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, this.player2);
            const letterCoords = validationInfo[0];
            const isValid = validationInfo[1];
            if (isValid !== null) {
                return isValid as string;
            }
            gameboard = this.letterPlacement.placeLetter(letterCoords as GameboardCoordinate[], this.player2, this.gameboard);
            // TODO: test to do
            if (gameboard[0] === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, this.player2.rack);
            }
            if (this.player2.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.end();
            }
            return gameboard as [boolean, Gameboard];
        }

        return gameboard;
    }

    /**
     * Exchange letters.
     *
     * @param player1 : The active player who will exchange.
     * @param letters : The letters to exchange.
     */
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

    /**
     * Abandon a game, which will resume in a lost for the player who abandoned.
     */
    abandon(): void {
        this.end();
    }
}
