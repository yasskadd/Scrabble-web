// import { Message } from '@app/message';
// import { DateService } from '@app/services/date.service';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';

const NUMBER_PLAYER = 2;
const SECOND = 1000;

@Service()
export class TurnService {
    private activePlayer: Player;
    private time: number;
    private inactivePlayer: Player;
    private timeOut: NodeJS.Timer;

    constructor(time: number) {
        this.time = time;
    }

    /**
     * Start player's turn system.
     */
    start(): void {
        let tempTime = this.time;
        this.timeOut = setInterval(() => {
            tempTime = tempTime - 1;
            if (tempTime === -1) {
                clearInterval(this.timeOut);
                this.end();
            }
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
        this.activePlayer = randomNumber === 0 ? player1 : player2;
        this.inactivePlayer = randomNumber === 0 ? player2 : player1;
    }

    /**
     * End the turn of the current player and start the turn of the player pass as parameter.
     *
     * @param player : The player who is playing next.
     */
    end(player: Player | undefined = this.inactivePlayer): void {
        clearInterval(this.timeOut);
        const tempInactivePlayer: Player = player;
        this.inactivePlayer = this.activePlayer;
        this.activePlayer = tempInactivePlayer;

        if (this.activePlayer !== undefined) {
            this.start();
        }
    }

    /**
     * Verify if a player is the active player.
     *
     * @param player : The player that needs to be checked.
     * @returns : Return a boolean. If it returns true, the player passed as parameter is the active player.
     */
    validating(player: Player): boolean {
        return this.activePlayer === player ? true : false;
    }
}
