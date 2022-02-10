import { GameBoard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player';
import { PlacementCommandInfo } from '@app/command-info';
import { Letter } from '@common/letter';
import { Inject, Service } from 'typedi';
import { LetterPlacementService } from './letter-placement.service';
import { LetterReserveService } from './letter-reserve.service';
import { TurnService } from './turn.service';

// Temporary place
// interface Letter {
//     letter: string;
//     quantity: number;
//     weight: number;
// }

const MAX_QUANTITY = 7;

@Service()
export class GameService {
    player1: Player;
    player2: Player;
    gameboard: GameBoard;

    constructor(
        player1: Player,
        player2: Player,
        public turn: TurnService,
        public letterReserve: LetterReserveService,
        @Inject() private letterPlacement: LetterPlacementService,
    ) {
        // this.start(player1, player2);
        this.player1 = player1;
        this.player2 = player2;
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
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            this.turn.end();
            return true;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            this.turn.end();
            return true;
        }

        return false;
    }

    /**
     * Play the turn by placing letters.
     *
     * @param playerName : The active player who will play.
     */
    play(playerName: string, commandInfo: PlacementCommandInfo): [boolean, GameBoard] {
        let gameBoard: [boolean, GameBoard] = [false, this.gameboard];
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            gameBoard = this.letterPlacement.placeLetter(this.player1, commandInfo, this.gameboard);
            this.turn.end();
            return gameBoard;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            gameBoard = this.letterPlacement.placeLetter(this.player2, commandInfo, this.gameboard);
            this.turn.end();
            return gameBoard;
        }

        return gameBoard;
    }

    /**
     * Exchange letters.
     *
     * @param player1 : The active player who will exchange.
     * @param letters : The letters to exchange.
     */
    exchange(letters: Letter[], playerName: string): Letter[] {
        if (this.turn.validating(playerName) && this.player1.name === playerName) {
            this.player1.rack = this.letterReserve.exchangeLetter(letters, this.player1.rack);
            this.turn.end();

            return this.player1.rack;
        } else if (this.turn.validating(playerName) && this.player2.name === playerName) {
            this.player2.rack = this.letterReserve.exchangeLetter(this.player2.rack, this.player2.rack);
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
