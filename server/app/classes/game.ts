import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { Turn } from '@app/classes/turn';
import { BoxMultiplierService } from '@app/services/box-multiplier.service';
import { LetterReserveService } from '@app/services/letter-reserve.service';
import { Letter } from '@common/letter';
import { Container } from 'typedi';

// Temporary place
// interface Letter {
//     letter: string;
//     quantity: number;
//     weight: number;
// }

const MAX_QUANTITY = 7;

export class Game {
    player1: Player;
    player2: Player;
    gameboard: Gameboard;

    constructor(
        player1: Player,
        player2: Player,
        public turn: Turn,
        public letterReserve: LetterReserveService, // @Inject() private letterPlacement: LetterPlacementService,
    ) {
        this.player1 = player1;
        this.player2 = player2;
        this.start();
        const boxMultiplierService = Container.get(BoxMultiplierService);
        this.gameboard = new Gameboard(boxMultiplierService);
    }

    /**
     * Start a game.
     *
     * @param player1 : The first player in the game.
     * @param player2 : The second player in the game.
     * @param time    : The maximum time allowed per player's turn.
     */
    start(): void {
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player2.rack);
        this.turn.determinePlayer(this.player1, this.player2);
        this.turn.start();
    }

    /**
     * End a game.
     *
     */
    end(): void {
        this.turn.end(undefined);
        // console.log("Game has ended");
    }

    /**
     * Skip a turn.
     *
     * @param playerName : The active player who will skip.
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
    // play(playerName: string, commandInfo: PlacementCommandInfo): [boolean, GameBoard] {
    //     let gameBoard: [boolean, GameBoard] = [false, this.gameboard];
    //     if (this.turn.validating(playerName) && this.player1.name === playerName) {
    //         // validate Command
    //         const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, this.player1);
    //         const letterCoords = validationInfo[0];
    //         // const isValid: boolean = validationInfo[1] as boolean;
    //         // if (!isValid) {
    //         //     // Emit invalid command
    //         // }
    //         gameBoard = this.letterPlacement.placeLetter(letterCoords as GameboardCoordinate[], this.player1, this.gameboard);
    //         this.turn.resetSkipCounter();
    //         this.turn.end();
    //         return gameBoard;
    //     } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
    //         gameBoard = this.letterPlacement.placeLetter(commandInfo, this.player2,this.gameboard);
    //         this.turn.resetSkipCounter();
    //         this.turn.end();
    //         return gameBoard;
    //     }

    //     return gameBoard;
    // }

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
     *
     */
    abandon(): void {
        this.end();
    }
}
