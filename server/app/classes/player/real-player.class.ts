import { Game } from '@app/services/game.service';
import { PlaceLettersReturn } from '@app/services/letter-placement.service';
import { CommandInfo } from '@common/command-info';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { Player } from './player.class';

type PlayerInformation = { name: string; score: number; rack: Letter[]; room: string; gameboard: LetterTile[] };

export class RealPlayer extends Player {
    game: Game;
    isPlayerOne: boolean;

    setGame(game: Game, isPlayerOne: boolean) {
        this.game = game;
        this.isPlayerOne = isPlayerOne;
    }

    placeLetter(commandInfo: CommandInfo): PlaceLettersReturn | string {
        if (this.game === undefined) return 'error';
        return this.game.play(this, commandInfo);
    }

    exchangeLetter(letters: string[]) {
        if (this.game === undefined) return;
        this.rack = this.game.exchange(letters, this);
    }
    skipTurn() {
        if (this.game === undefined) return;
        this.game.skip(this.name);
    }
    getInformation(): void | PlayerInformation {
        if (this.game === undefined) return;
        return {
            name: this.name,
            score: this.score,
            rack: this.rack,
            room: this.room,
            gameboard: this.game.gameboard.gameboardTiles,
        };
    }
}
