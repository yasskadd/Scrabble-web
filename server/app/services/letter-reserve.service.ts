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

    removeLetter(letterToRemove: Letter): void {
        this.lettersReserve.forEach((letter) => {
            if (letter.value === letterToRemove.value) {
                letter.quantity--;
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-shadow
        // this.lettersReserve = this.lettersReserve.filter((letter) => letter.quantity !== 0);
    }

    insertLetter(removedLetters: Letter[]): Letter[] {
        const updatedLetterReserve = this.lettersReserve;
        for (const letterToRemove of removedLetters) {
            const index = this.lettersReserve.findIndex((letter) => letter.value === letterToRemove.value);
            if (index < 0) {
                const newLetter = { value: letterToRemove.value, quantity: 1, points: letterToRemove.points };
                updatedLetterReserve.push(newLetter);
            } else {
                updatedLetterReserve[index].quantity++;
            }
        }

        return updatedLetterReserve;
    }

    distributeLetter(rack: Letter[]): void {
        const nLetters = this.lettersReserve.length;
        let random = Math.floor(Math.random() * nLetters);
        let letter = this.lettersReserve[random];
        while (this.lettersReserve[random].quantity === 0) {
            random = Math.floor(Math.random() * nLetters);
            letter = this.lettersReserve[random];
        }
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
        if (this.lettersReserve.length >= NUMBER_OF_LETTERS_ON_RACK) {
            const removedLetter = this.removeLettersFromRack(toExchange, rack);
            rack = removedLetter[0];

            const newRack = this.generateLetters(removedLetter[1].length, rack);

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
