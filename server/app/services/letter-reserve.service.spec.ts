import * as letterTypes from '@app/letter-reserve';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import { spy } from 'sinon';
import { LetterReserveService } from './letter-reserve.service';

describe('LetterReserveService', () => {
    let letterReserveService: LetterReserveService;
    let sampleRack: Letter[];
    let emptyRack: Letter[];

    beforeEach(() => {
        letterReserveService = new LetterReserveService();
        emptyRack = [];
        sampleRack = [
            { value: 'a', quantity: 8, points: 1 },
            { value: 'b', quantity: 0, points: 3 },
            { value: 'b', quantity: 0, points: 3 },
            { value: 'c', quantity: 1, points: 3 },
            { value: 'd', quantity: 2, points: 2 },
        ];
    });

    it('should generate default letter reserve', () => {
        const defaultLetterReserve = letterReserveService.getDefaultLetterReserve();
        expect(defaultLetterReserve).to.eql(letterTypes.LETTERS);
    });

    it('should subtract letter quantity by 1', () => {
        const expectedQuantity = letterReserveService.lettersReserve[0].quantity - 1;
        const letterToRemove: Letter = { value: 'a', quantity: 9, points: 3 };
        letterReserveService.removeLetter(letterToRemove);
        expect(letterReserveService.lettersReserve[0].quantity).to.equal(expectedQuantity);
    });
    it('should increment letter quantity by 1 when a letter is inserted to the letter reserve', () => {
        letterReserveService.lettersReserve = [{ value: 'a', quantity: 1, points: 1 }];
        const expectedLength = letterReserveService.lettersReserve.length;
        const letterToInsert: Letter[] = [{ value: 'a', points: 1 } as Letter];
        const expectedLetterReserve = letterReserveService.insertLetter(letterToInsert);

        expect(expectedLetterReserve.length).to.equal(expectedLength);
        expect(expectedLetterReserve[0].quantity).to.equal(2);
    });

    it('should return random letter', () => {
        const expectedLength = sampleRack.length + 1;
        letterReserveService.distributeLetter(sampleRack);
        expect(sampleRack.length).to.equal(expectedLength);
    });

    it('distributeLetter should call shuffleArray()', () => {
        const shuffleArraySpy = spy(letterReserveService, 'shuffleArray' as never);
        letterReserveService.distributeLetter(sampleRack);
        expect(shuffleArraySpy.called).to.equal(true);
    });

    it('should remove one letter from the rack', () => {
        const expectedLength = sampleRack.length - 1;
        const updatedRack = letterReserveService.removeLettersFromRack(['a'], sampleRack)[0];
        expect(updatedRack.length).to.equal(expectedLength);
    });

    it('should remove one and only one letter B from the rack which contains two B', () => {
        const expectedLength = sampleRack.length - 1;
        const letterToRemove = { value: 'b', quantity: 0, points: 3 };
        const updatedRack = letterReserveService.removeLettersFromRack([letterToRemove.value], sampleRack)[0];

        expect(updatedRack).to.deep.include(letterToRemove);
        expect(updatedRack.length).to.equal(expectedLength);
    });

    it('should properly exchange letters from rack', () => {
        const oldRack = sampleRack;
        const newRack = letterReserveService.exchangeLetter(
            sampleRack.map((letter) => {
                return letter.value;
            }),
            sampleRack,
        );

        expect(newRack).to.not.equal(oldRack);
        expect(newRack.length).to.equal(oldRack.length);
    });

    it('should not exchange letter when the reserve has less than 7 letters', () => {
        const nLetters = 6;
        const oldRack = sampleRack;
        letterReserveService.lettersReserve = letterReserveService.lettersReserve.slice(0, nLetters);
        const newRack = letterReserveService.exchangeLetter(
            sampleRack.map((letter) => {
                return letter.value;
            }),
            sampleRack,
        );
        expect(newRack).to.equal(oldRack);
        expect(newRack.length).to.equal(oldRack.length);
    });

    it('should be able to generate a random quantity of letters', () => {
        const randomQuantity = 7;
        const rack = letterReserveService.generateLetters(randomQuantity, emptyRack);
        expect(rack.length).to.equal(randomQuantity);
    });

    it('should return true if the reserve is empty', () => {
        letterReserveService.lettersReserve = [];
        const isEmpty = letterReserveService.isEmpty();
        expect(isEmpty).to.eql(true);
    });

    it('should return false if the reserve is not empty', () => {
        const isEmpty = letterReserveService.isEmpty();
        expect(isEmpty).to.eql(false);
    });

    it('shuffleArray should shuffle the letters array passed as argument', () => {
        const array = [{ value: 'a' } as Letter, { value: 'b' } as Letter, { value: 'c' } as Letter];
        // eslint-disable-next-line dot-notation
        expect(letterReserveService['shuffleArray'](array)).to.not.eql(array);
    });
});
