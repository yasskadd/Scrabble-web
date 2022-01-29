// import { Message } from '@app/message';
// import { DateService } from '@app/services/date.service';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';

const NUMBER_PLAYER = 2;

@Service()
export class TurnService {
    private activePlayer: Player;
    private time: number;

    constructor() {}

    determinePlayerTurn(player1: Player, player2: Player) {
        const randomNumber = Math.floor(Math.random() * NUMBER_PLAYER);
        this.activePlayer = randomNumber === 0 ? player1 : player2;
    }

    endTurn(player: Player) {
        this.activePlayer = player;
    }

    validatingTurn(player: Player) {
        return this.activePlayer === player ? true : false;
    }
}
