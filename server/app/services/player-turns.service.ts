// import { Message } from '@app/message';
// import { DateService } from '@app/services/date.service';
import { Service } from 'typedi';

@Service()
export class PlayerTurnsService {
    const player1 = Player();
    const player2 = Player();
    const players = [player1, player1];
    constructor() {}

    determinePlayerTurn() {
        const firstTurn = Math.floor(Math.random() * 1);
    }

    endTurn(Player) {
        this.player1.turn = false
    }
    
}


class Player {
    const id = 0;
    const name: String | undefined;
    let lettersInHolder = 7;
    let score = 0;
    let turn = false;

    constructor (name: String) { this.name = name;}
}