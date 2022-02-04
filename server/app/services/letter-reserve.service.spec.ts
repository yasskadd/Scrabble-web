// import { Letter } from '@app/letter';
import { expect } from 'chai';
import * as letterJSON from '../../assets/letter-reserve.json';
import { Letter, LetterReserveService } from './letter-reserve.service';

describe('LetterReserveService', () => {
    let service: LetterReserveService;
    // let reserveTest: Letter[];
    let sampleRack: Letter[];
    let emptyRack: Letter[];
    const letterReserve: Letter[] = letterJSON.letters;

    beforeEach(() => {
        service = new LetterReserveService();
        // reserveTest = service.lettersReserve;
        emptyRack = [];
        sampleRack = [
            { letter: 'A', quantity: 9, weight: 3 },
            { letter: 'B', quantity: 2, weight: 4 },
            { letter: 'C', quantity: 2, weight: 3 },
            { letter: 'D', quantity: 3, weight: 2 },
        ];
    });

    it('default letter reserve should be generated', () => {
        const defaultLetterReserve = service.getDefaultLetterReserve();
        expect(defaultLetterReserve).to.eql(letterReserve);
    });

    it('should subtracts letter quantity by 1', () => {
        const expectedQuantity = 8;
        const letterToRemove: Letter = { letter: 'A', quantity: 9, weight: 3 };
        service.updateReserve(letterToRemove);
        expect(service.lettersReserve[0].quantity).to.eql(expectedQuantity);
    });

    it('should remove the letter form the reserve if the quantity of the letter is 0', () => {
        const expectedLength = service.lettersReserve.length - 1;
        const letterToRemove = { letter: 'Z', quantity: 1, weight: 10 };
        service.updateReserve(letterToRemove);
        expect(service.lettersReserve.length).to.eql(expectedLength);
    });

    it('should return random letter', () => {
        const expectedLength = sampleRack.length + 1;
        service.distributeLetter(sampleRack);
        expect(sampleRack.length).to.eql(expectedLength);
    });

    it('should be able to generate a random quantity of letters', () => {
        const randomQuantity = 7;
        const rack = service.generateLetters(randomQuantity, emptyRack);
        expect(rack.length).to.eql(randomQuantity);
    });

    it('should remove one letter from the rack', () => {
        const expectedLength = sampleRack.length - 1;
        const updatedRack = service.removeLettersFromRack([{ letter: 'A', quantity: 9, weight: 3 }], sampleRack);

        expect(updatedRack.length).to.eql(expectedLength);
    });

    it('properly exchange letter', () => {
        const oldRack = sampleRack;
        const newRack = service.exchangeLetter(sampleRack, sampleRack);
        expect(newRack).to.not.eql(oldRack);
        expect(newRack.length).to.eql(oldRack.length);
    });
});
