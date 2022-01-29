// Temporary place
interface Letter {
    letter: string;
    quantity: number;
    weight: number;
}

export class Player {
    rack: Letter[] = [];
    private score: number = 0;
    private name: string;
    // private objs[] : Objectif;

    constructor(name: string) {
        this.name = name;
    }
}
