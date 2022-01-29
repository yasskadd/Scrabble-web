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
    time: number;
    turn: TurnService;

    constructor(player1: Player, player2: Player) {
        this.start(player1, player2);
    }

    start(player1: Player, player2: Player) {
        this.player1 = player1;
        this.player2 = player2;
        this.turn = new TurnService();
        this.letterReserve = new LetterReserveService();

        this.letterReserve.generateLetters(MAX_QUANTITY, this.player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, this.player2.rack);
        this.turn.determinePlayerTurn(this.player1, this.player2);
    }

    end() {
        this.turn.endTurn(null);
        // console.log("Game has ended");
    }

    skip(player1: Player, player2: Player) {
        if (this.turn.validatingTurn(player1)) {
            this.turn.endTurn(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    play(player1: Player, player2: Player) {
        if (this.turn.validatingTurn(player1)) {
            // TODO Add place letter logic
            // console.log('play');
            this.turn.endTurn(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    exchange(player1: Player, player2: Player, letters: Letter[]) {
        if (this.turn.validatingTurn(player1)) {
            player1.rack = this.letterReserve.exchangeLetter(letters, player1.rack);
            this.turn.endTurn(player2);
        } else {
            // console.log('Not your turn');
        }
    }

    abandon() {
        this.end();
    }
}
