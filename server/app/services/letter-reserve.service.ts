// import { Letter } from '../../app/letter';
import * as letterJSON from '@app/../assets/letter-reserve.json';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

// Temporary place
// export interface Letter {
//     letter: string;
//     quantity: number;
//     weight: number;
// }

@Service()
export class LetterReserveService {
    lettersReserve: Letter[];
    constructor() {
        this.lettersReserve = this.getDefaultLetterReserve();
    }

    /**
     * Get the default letter reserve.
     *
     * @return Letter[] : Return the default list of letters.
     */
    getDefaultLetterReserve(): Letter[] {
        // const defaultLetterReserve: Letter[] = Object.assign({}, letterJSON).letters;
        const defaultLetterReserve = letterJSON.letters.map((letter) => {
            return letter;
        });

        return defaultLetterReserve;
    }

    /**
     * Update the letter reserve
     *
     * @param letter : The letter that has to be updated in the reserve.
     */
    updateReserve(letter: Letter): void {
        this.lettersReserve.forEach((value) => {
            if (value.stringChar === letter.stringChar) {
                value.quantity--;
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-shadow
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
    removeLettersFromRack(toBeRemoved: string[], rack: Letter[]): [Letter[], Letter[]] {
        let tempRack = rack.map((letter) => {
            return letter.stringChar;
        });

        const tempToBeRemoved: (string | Letter)[] = [];

        tempRack = tempRack.filter((letter) => {
            const index = toBeRemoved.indexOf(letter);
            if (index >= 0) {
                tempToBeRemoved.push(toBeRemoved[index]);
                toBeRemoved.splice(index, 1);
                // delete toBeRemoved[index];
            }
            return index < 0;
        });

        const updatedRack: Letter[] = [];

        for (const letter of tempRack) {
            const index = rack.findIndex((element) => {
                return element.stringChar === letter;
            });
            updatedRack.push(rack[index]);
        }

        tempToBeRemoved.map((removedLetter) => {
            const index = rack.findIndex((element) => {
                return element.stringChar === removedLetter;
            });

            return rack[index];
        });

        return [updatedRack, tempToBeRemoved as Letter[]];
    }

    /**
     * Exchange letters
     *
     * @param letters : The letters that the player wants to exchange.
     * @param rack : The rack of the player.
     * @returns : The new updated rack.
     */
    exchangeLetter(toExchange: string[], rack: Letter[]): Letter[] {
        // Remove the letters from the rack of the player
        if (this.lettersReserve.length >= 7) {
            const removedLetter = this.removeLettersFromRack(toExchange, rack);
            rack = removedLetter[0];

            // Exchange X quantity of letters
            const newRack = this.generateLetters(removedLetter[1].length, rack);

            // Update de letter reserve
            const updatedLetterReserve = this.lettersReserve;
            for (const letter of this.removeLettersFromRack(toExchange, rack)[1]) {
                const index = this.lettersReserve.findIndex((element) => element.stringChar === letter.stringChar);
                if (index < 0) {
                    const newLetter = { stringChar: letter.stringChar, quantity: 1, points: letter.points };
                    updatedLetterReserve.push(newLetter);
                } else {
                    updatedLetterReserve[index].quantity++;
                }
            }

            this.lettersReserve = updatedLetterReserve;
            return newRack;
        } else {
            return rack;
        }
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
        }

        return rack;
    }
}
