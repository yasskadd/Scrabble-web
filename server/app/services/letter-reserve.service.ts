// import { HttpClient } from '@angular/common/http';
import letterJSON from '../app/assets/letter-reserve.json';

interface LetterScheme {
    letter: string;
    quantity: number;
    weight: number;
}

export class LetterReserveService {
    lettersReserve: [];
    playerRack: [];
    constructor() {
        this.lettersReserve = this.getLetterReserve();
    }

    getLetterReserve(): [] {
        return JSON.parse(letterJSON).letters;
    }

    updateReserve(letter: LetterScheme): void {
        // modify json file with new quantities
        // this.lettersReserve['letters'][0].quantity -= 1;
        // this.lettersReserve.find( obj => obj.letter === letter;  ).quantity--;
        letter.quantity -= 1;
    }

    addLetter(): LetterScheme {
        const max = 27; // lettersReserve.length
        const random = Math.floor(Math.random() * max);
        const letter = this.lettersReserve[random];
        this.updateReserve(letter);
        this.playerRack.push(letter);
        return letter;
    }

    generateLetters(): void {
        // start of the game
        const initializeLetters = 7;
        for (let i = 0; i < initializeLetters; i++) {
            const letter: LetterScheme = this.addLetter();
            this.updateReserve(letter);
        }
    }

    ngOnInit(): void {
        // this.lettersReserve = this.getLetterReserve().letters;
        this.generateLetters();
    }
}
// GENERATE RANDOM LETTER
const letters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];
