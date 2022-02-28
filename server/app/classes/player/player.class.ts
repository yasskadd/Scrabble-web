import { Gameboard } from '@app/classes/gameboard.class';
import { CommandInfo } from '@app/command-info';
import { Game } from '@app/services/game.service';
import { Letter } from '@common/letter';

export class Player {
    rack: Letter[] = [];
    score: number = 0;
    name: string;
    room: string;
    game: Game;
    isPlayerOne: boolean;

    constructor(name: string) {
        this.name = name;
    }

    setGame(game: Game, isPlayerOne: boolean) {
        this.game = game;
        this.isPlayerOne = isPlayerOne;
    }

    placeLetter(commandInfo: CommandInfo): [boolean, Gameboard] | string | void {
        if (this.game === undefined) return;
        return this.game.play(this, commandInfo);
    }

    exchangeLetter(letters: string[]) {
        if (this.game === undefined) return;
        this.rack = this.game.exchange(letters, this);
    }

    rackIsEmpty(): boolean {
        return this.rack.length === 0;
    }
}
