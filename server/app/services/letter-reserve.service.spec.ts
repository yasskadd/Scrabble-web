import { TestBed } from '@angular/core/testing';
import { LetterReserveService } from './letter-reserve.service';

describe('LetterReserveService', () => {
    let service: LetterReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LetterReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
