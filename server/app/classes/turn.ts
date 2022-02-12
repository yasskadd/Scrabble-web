// import { Message } from '@app/message';
// import { DateService } from '@app/services/date.service';
import { Player } from '@app/classes/player';
import { ReplaySubject } from 'rxjs';

const NUMBER_PLAYER = 2;
const SECOND = 1000;

export class Turn {
    activePlayer: string | undefined;
    inactivePlayer: string | undefined;
    endTurn: ReplaySubject<string | undefined>;
    countdown: ReplaySubject<number | undefined>;
    private skipCounter: number = 0;
    private time: number;
    private timeOut: unknown;

    constructor(time: number) {
        this.time = time;
        this.endTurn = new ReplaySubject(1);
        this.countdown = new ReplaySubject(1);
    }

    /**
     * Start player's turn system.
     */
    start(): void {
        let tempTime = this.time;
        this.timeOut = setInterval(() => {
            tempTime = tempTime - 1;
            if (tempTime === 0) {
                clearInterval(this.timeOut as number);
                this.end();
            }
            this.countdown.next(tempTime);
        }, SECOND);
    }

    /**
     * Determine which player between player1 and player2 who starts each round.
     *
     * @param player1 : One of the two player in the game.
     * @param player2 : The other player in the game.
     */
    determinePlayer(player1: Player, player2: Player): void {
        const randomNumber: number = Math.floor(Math.random() * NUMBER_PLAYER);
        this.activePlayer = randomNumber === 0 ? player1.name : player2.name;
        this.inactivePlayer = randomNumber === 0 ? player2.name : player1.name;
    }

    /**
     * End the turn of the current player and start the turn of the player pass as parameter.
     *
     * @param playerName : The player who is playing next.
     */
    end(endGame?: boolean): void {
        clearInterval(this.timeOut as number);

        if (!endGame) {
            const tempInactivePlayer: string | undefined = this.inactivePlayer;
            this.inactivePlayer = this.activePlayer;
            this.activePlayer = tempInactivePlayer;
            this.start();
        } else {
            this.activePlayer = undefined;
            this.inactivePlayer = undefined;
        }
        this.endTurn.next(this.activePlayer);
    }

    /**
     * Verify if a player is the active player.
     *
     * @param playerName : The player that needs to be checked.
     * @returns : Return a boolean. If it returns true, the player passed as parameter is the active player.
     */
    validating(playerName: string): boolean {
        return String(this.activePlayer) === playerName;
    }

    skipTurn(): void {
        this.incrementSkipCounter();
        if (this.skipCounter === 6) this.end(true);
        this.end();
    }

    resetSkipCounter(): void {
        this.skipCounter = 0;
    }

    private incrementSkipCounter(): void {
        this.skipCounter++;
    }
}
