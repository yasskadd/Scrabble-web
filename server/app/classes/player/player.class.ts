import { Game } from '@app/services/game.service';
import { LetterTile } from '@common/classes/letter-tile.class';
import { Letter } from '@common/interfaces/letter';

type PlayerInformation = { name: string; score: number; rack: Letter[]; room: string; gameboard: LetterTile[] };

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

    getInformation(): PlayerInformation {
        if (this.game === undefined) return {} as PlayerInformation;
        return {
            name: this.name,
            score: this.score,
            rack: this.rack,
            room: this.room,
            gameboard: this.game.gameboard.gameboardTiles,
        };
    }

    rackIsEmpty(): boolean {
        return this.rack.length === 0;
    }

    rackToString() {
        const stringArray: string[] = [];
        this.rack.forEach((letter) => {
            stringArray.push(letter.value);
        });
        return stringArray;
    }

    deductPoints() {
        let pointsToDeduct = 0;
        for (const letter of this.rack) {
            pointsToDeduct += letter.points;
        }
        this.score -= pointsToDeduct;

        if (this.score < 0) {
            this.score = 0;
        }
    }

    addPoints(rack: Letter[]) {
        let pointsToAdd = 0;
        for (const letter of rack) {
            pointsToAdd += letter.points;
        }
        this.score += pointsToAdd;
    }
}
