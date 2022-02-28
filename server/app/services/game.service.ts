import { Gameboard } from '@app/classes/gameboard.class';
import { Player } from '@app/classes/player/player.class';
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
    gameboard: Gameboard;

    constructor(
        player1: Player,
        player2: Player,
        public turn: Turn,
        public letterReserve: LetterReserveService,
        @Inject() private letterPlacement: LetterPlacementService,
    ) {
        this.start(player1, player2);
        const boxMultiplierService = Container.get(BoxMultiplierService);
        this.gameboard = new Gameboard(boxMultiplierService);
    }

    start(player1: Player, player2: Player): void {
        this.letterReserve.generateLetters(MAX_QUANTITY, player1.rack);
        this.letterReserve.generateLetters(MAX_QUANTITY, player2.rack);
        this.turn.determinePlayer(player1, player2);
        this.turn.start();
    }

    end(): void {
        this.turn.end(true);
    }

    skip(playerName: string): boolean {
        if (!this.turn.validating(playerName)) return false;
        this.turn.skipTurn();
        return true;
    }

    play(player: Player, commandInfo: CommandInfo): [boolean, Gameboard] | string {
        let gameboard: [boolean, Gameboard] = [false, this.gameboard];
        const numberOfLetterPlaced = commandInfo.lettersPlaced.length;
        if (this.turn.validating(player.name)) {
            const validationInfo = this.letterPlacement.globalCommandVerification(commandInfo, this.gameboard, player);
            const letterCoords = validationInfo[0];
            const isValid = validationInfo[1];
            if (isValid !== null) {
                this.turn.resetSkipCounter();
                this.turn.end();
                return isValid as string;
            }
            gameboard = this.letterPlacement.placeLetter(letterCoords as LetterTile[], player, this.gameboard);

            if (gameboard[0] === true) {
                this.letterReserve.generateLetters(numberOfLetterPlaced, player.rack);
            }

            if (player.rackIsEmpty() && this.letterReserve.isEmpty()) {
                this.end();
            } else {
                this.turn.resetSkipCounter();
                this.turn.end();
            }
            return gameboard;
        }

        return gameboard;
    }

    exchange(letters: string[], player: Player): Letter[] {
        if (this.turn.validating(player.name)) {
            player.rack = this.letterReserve.exchangeLetter(letters, player.rack);
            this.turn.resetSkipCounter();
            this.turn.end();
            return player.rack;
        }
        return [];
    }

    abandon(): void {
        this.end();
    }
}
