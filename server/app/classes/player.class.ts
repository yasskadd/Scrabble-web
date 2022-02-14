// Temporary place
// interface Letter {
//     letter: string;
//     quantity: number;
//     weight: number;
// }

export class Player {
    rack: string[] = [];
    score: number = 0;
    name: string;
    room: string;
    // private objs[] : Objectif;

    constructor(name: string) {
        this.name = name;
    }

    public removeLetterFromRack(commandLetters: string) {
        for (let letterIndex = 0; letterIndex < this.rack.length; letterIndex++) {
            if (this.rack[letterIndex] === commandLetters) {
                this.rack.splice(letterIndex, 1);
                break;
            }
        }
    }

    public replaceLettersOnRack(commandLetters: string[]) {
        commandLetters.forEach((commandLetter) => {
            this.rack.push(commandLetter);
        });
    }
}
