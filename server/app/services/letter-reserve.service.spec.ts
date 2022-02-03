// import { Letter } from '@app/letter';
import { expect } from 'chai';
import { Letter, LetterReserveService } from './letter-reserve.service';

describe.only('LetterReserveService', () => {
    let service: LetterReserveService;
    // let reserveTest: Letter[];
    let sampleRack: Letter[];
    let emptyRack: Letter[];

    beforeEach(() => {
        service = new LetterReserveService();
        // reserveTest = service.lettersReserve;
        emptyRack = [];
        sampleRack = [
            { letter: 'A', quantity: 2, weight: 3 },
            { letter: 'B', quantity: 2, weight: 4 },
            { letter: 'C', quantity: 2, weight: 3 },
            { letter: 'D', quantity: 2, weight: 2 },
        ];
    });

    it('default letter reserve should be generated', () => {
        const defaultLetterReserve = service.getLetterReserve();
        expect(defaultLetterReserve).to.be.an('Letter[]');
    });

    it('should return random letter', () => {
        service.distributeLetter(sampleRack);
        // expect(sampleRack).to.be.an('array');
        expect(sampleRack.length).to.equal(5);
        // expect(letterGenerated).to.be.a('Letter');
        // mock/stub later on to make sure reserve is updated
        // expect(letterGenerated).to.call(service.updateReserve(letterGenerated));
    });

    it('should generate 7 letters for game initialization', () => {
        const initialLetters = 7;
        const gameInitialization = service.generateLetters(initialLetters, emptyRack);
        expect(gameInitialization.length).to.eql(initialLetters);
    });

    it('player rack should have one less letter when one is removed from the rack', () => {
        const updatedRack = service.removeLettersFromRack([{ letter: 'A', quantity: 2, weight: 3 }], sampleRack);
        expect(updatedRack.length).to.eql(3);
    });

    // it('properly exchange letter', () => {
    //     const obj = createSpyObj('Letter', {}, { letter: 'D', quantity: 3, weight: 2 });
    //     expect(obj.quantity).equal(3);

    //     // service.Letter.getOwnPropertyDescriptor(obj, 'quantity').get.and.returnValue(7);
    //     expect(obj.quantity).equal(2);
    // });
});
