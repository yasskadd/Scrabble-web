// import { HttpClient } from '@angular/common/http';
import letterJSON from '@app/assets/letter-reserve.json';

// Temporary place
interface Letter {
    letter: string;
    quantity: number;
    weight: number;
}

export class LetterReserveService {
    lettersReserve: Letter[];
    constructor() {
        this.lettersReserve = this.getLetterReserve();
    }

    /**
     * Get the default letter reserve.
     *
     * @return Letter[] : Return the default list of letters.
     */
    getLetterReserve(): Letter[] {
        // return JSON.parse(letterJSON).letters;
        return letterJSON.letters;
    }

    /**
     * Update the letter reserve
     *
     * @param letter : The letter that has to be updated in the reserve.
     */
    updateReserve(letter: Letter): void {
        letter.quantity--;
        this.lettersReserve = this.lettersReserve.filter((letter) => letter.quantity !== 0);
    }

    /**
     * The reserve gives a random letter from the letter reserve to a player.
     *
     * @param rack : The rack of the player.
     */
    addLetter(rack: Letter[]): void {
        const nLetters = this.lettersReserve.length;
        const random = Math.floor(Math.random() * nLetters);
        const letter = this.lettersReserve[random];
        this.updateReserve(letter);
        rack.push(letter);
    }

    /**
     * Exchange letters
     *
     * @param letters : The letters that the player wants to exchange.
     * @param rack : The rack of the player.
     * @returns : The new updated rack.
     */
    exchangeLetter(letters: Letter[], rack: Letter[]): Letter[] {
        // Remove the letters from the rack of the player
        rack = rack.filter((letter) => !letters.includes(letter));

        // Exchange X quantity of letters
        this.generateLetters(letters.length, rack);

        // Put back the letters exchanged into the reserve
        letters.forEach((letter) => {
            if (letter.quantity === 0 && !this.lettersReserve.includes(letter)) {
                this.lettersReserve.push(letter);
            }
        });

        for (let i = 0; i < letters.length; i++) {
            for (let j = 0; j < this.lettersReserve.length; j++) {
                if (letters[i].letter === this.lettersReserve[j].letter) {
                    this.lettersReserve[j].quantity++;
                }
            }
        }

        return rack;
    }

    /**
     * The letter reserve gives X quantity of random letter to a player.
     *
     * @param quantity : The number of letter to be given from the letter reserve to a player.
     * @param rack : The rack of the player.
     */
    generateLetters(quantity: number, rack: Letter[]): void {
        for (let i = 0; i < quantity; i++) {
            this.addLetter(rack);
        }
    }
}
