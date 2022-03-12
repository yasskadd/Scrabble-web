import { Game } from '@app/services/game.service';
import { Letter } from '@common/interfaces/letter';

export class Player {
    rack: Letter[];
    score: number;
    name: string;
    room: string;
    game: Game;
    isPlayerOne: boolean;

    constructor(name: string) {
        this.rack = [];
        this.score = 0;
        this.name = name;
    }

    rackIsEmpty(): boolean {
        return this.rack.length === 0;
    }
}
