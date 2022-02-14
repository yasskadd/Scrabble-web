import { Letter } from '@common/letter';

export class Player {
    rack: Letter[] = [];
    score: number = 0;
    name: string;
    room: string;
    // private objs[] : Objectif;

    constructor(name: string) {
        this.name = name;
    }
}
