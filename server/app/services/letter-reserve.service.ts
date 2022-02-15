import * as letterTypes from '@app/letter-reserve';
import { Letter } from '@common/letter';
import { Service } from 'typedi';

const NUMBER_OF_LETTERS_ON_RACK = 7;

@Service()
export class LetterReserveService {
    lettersReserve: Letter[];
    constructor() {
        this.lettersReserve = this.getDefaultLetterReserve();
    }

    getDefaultLetterReserve(): Letter[] {
        const defaultLetterReserve: Letter[] = [];
        letterTypes.LETTERS.forEach((letter: Letter) => {
            defaultLetterReserve.push({ value: letter.value, quantity: letter.quantity, points: letter.points });
        });
        return defaultLetterReserve;
    }

    removeLetter(letter: Letter): void {
        this.lettersReserve.forEach((value) => {
            if (value.value === letter.value) {
                value.quantity--;
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-shadow
        this.lettersReserve = this.lettersReserve.filter((letter) => letter.quantity !== 0);
    }

    insertLetter(removedLetter: Letter[]): Letter[] {
        const updatedLetterReserve = this.lettersReserve;
        for (const letter of removedLetter) {
            const index = this.lettersReserve.findIndex((element) => element.value === letter.value);
            if (index < 0) {
                const newLetter = { value: letter.value, quantity: 1, points: letter.points };
                updatedLetterReserve.push(newLetter);
            } else {
                updatedLetterReserve[index].quantity++;
            }
        }

        return updatedLetterReserve;
    }

    distributeLetter(rack: Letter[]): void {
        const nLetters = this.lettersReserve.length;
        const random = Math.floor(Math.random() * nLetters);
        const letter = this.lettersReserve[random];
        this.removeLetter(letter);
        rack.push(letter);
    }

    removeLettersFromRack(toBeRemoved: string[], rack: Letter[]): [Letter[], Letter[]] {
        let tempRack = rack.map((letter) => {
            return letter.value;
        });

        const tempToBeRemoved: Letter[] = [];

        tempRack = tempRack.filter((letter, indx) => {
            const index = toBeRemoved.indexOf(letter);
            if (index >= 0) {
                tempToBeRemoved.push(rack[indx]);
                toBeRemoved.splice(index, 1);
            }
            return index < 0;
        });

        const updatedRack: Letter[] = [];

        for (const letter of tempRack) {
            const index = rack.findIndex((element) => {
                return element.value === letter;
            });
            updatedRack.push(rack[index]);
        }

        return [updatedRack, tempToBeRemoved];
    }

    exchangeLetter(toExchange: string[], rack: Letter[]): Letter[] {
        // Remove the letters from the rack of the player
        if (this.lettersReserve.length >= NUMBER_OF_LETTERS_ON_RACK) {
            const removedLetter = this.removeLettersFromRack(toExchange, rack);
            rack = removedLetter[0];

            // Exchange X quantity of letters
            const newRack = this.generateLetters(removedLetter[1].length, rack);

            // Update de letter reserve
            this.lettersReserve = this.insertLetter(removedLetter[1]);
            return newRack;
        } else {
            return rack;
        }
    }

    generateLetters(quantity: number, rack: Letter[]): Letter[] {
        for (let i = 0; i < quantity; i++) {
            this.distributeLetter(rack);
        }

        return rack;
    }

    isEmpty(): boolean {
        return this.lettersReserve.length === 0;
    }
}
