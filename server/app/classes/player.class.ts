import { Letter } from '@common/letter';

export class Player {
    rack: Letter[] = [];
    score: number = 0;
    name: string;
    room: string;

    constructor(name: string) {
        this.name = name;
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
}
