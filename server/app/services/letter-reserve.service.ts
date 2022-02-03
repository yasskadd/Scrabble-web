// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import { Letter } from '../../app/services/letter';
import * as letterJSON from '../../assets/letter-reserve.json';

// Temporary place
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

    distributeLetter(rack: Letter[]): void {
        const nLetters = this.lettersReserve.length;
        const random = Math.floor(Math.random() * nLetters);
        const letter = this.lettersReserve[random];
        this.updateReserve(letter);
        rack.push(letter);
    }

    /**
     * Remove a letter from player's rack
     * Function to be called for letter exchanges
     *
     * @param letter : The letter that has to be updated in the reserve.
     */
    removeLettersFromRack(toBeRemoved: Letter[], rack: Letter[]): Letter[] {
        rack = rack.filter((letter) => !toBeRemoved.includes(letter));
        return rack;
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
        rack = this.removeLettersFromRack(letters, rack);

        // Exchange X quantity of letters
        const newRack = this.generateLetters(letters.length, rack);

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
        return newRack;
    }

    /**
     * The letter reserve gives X quantity of random letter to a player.
     *
     * @param quantity : The number of letter to be given from the letter reserve to a player.
     * @param rack : The rack of the player.
     */
    generateLetters(quantity: number, rack: Letter[]): Letter[] {
        // const generatedQuantity = 0;
        for (let i = 0; i < quantity; i++) {
            this.distributeLetter(rack);
            // generatedQuantity++;
        }
        // return generatedQuantity;
        return rack;
    }
}
