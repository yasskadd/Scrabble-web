import { Letter } from '@common/letter';

export class Player {
    rack: Letter[] = [];
    score: number = 0;
    name: string;
    room: string;

    constructor(name: string) {
        this.name = name;
    }

    rackIsEmpty() {
        return this.rack.length === 0;
    }
}
