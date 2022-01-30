import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { LetterReserveService } from './letter-reserve.service';
import { TurnService } from './turn.service';

// Temporary place
interface Letter {
    letter: string;
    quantity: number;
    weight: number;
}

const MAX_QUANTITY = 7;

@Service()
export class GameService {
    player1: Player;
    player2: Player;
    letterReserve: LetterReserveService;
    turn: TurnService;

    constructor(player1: Player, player2: Player, time: number) {
        this.start(player1, player2, time);
    }

    /**
     * Start a game.
     *
     * @param player1 : The first player in the game.
     * @param player2 : The second player in the game.
     * @param time    : The maximum time allowed per player's turn.
     */
    start(player1: Player, player2: Player, time: number): void {
        this.player1 = player1;
        this.player2 = player2;
        this.turn = new TurnService(time);
        this.letterReserve = new LetterReserveService();

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
     * @param player1 : The active player who will skip.
     * @param player2 : The next active player.
     */
    skip(player1: Player, player2: Player): void {
        if (this.turn.validating(player1)) {
            this.turn.end(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    /**
     * Play the turn by placing letters.
     *
     * @param player1 : The active player who will play.
     * @param player2 : The next active player.
     */
    play(player1: Player, player2: Player): void {
        if (this.turn.validating(player1)) {
            // TODO Add place letter logic
            // console.log('play');
            this.turn.end(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    /**
     * Exchange letters.
     *
     * @param player1 : The active player who will exchange.
     * @param player2 : The next active player.
     * @param letters : The letters to exchange.
     */
    exchange(player1: Player, player2: Player, letters: Letter[]): void {
        if (this.turn.validating(player1)) {
            player1.rack = this.letterReserve.exchangeLetter(letters, player1.rack);
            this.turn.end(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    /**
     * Abandon a game, which will resume in a lost for the player who abandoned.
     *
     */
    abandon(): void {
        this.end();
    }
}
