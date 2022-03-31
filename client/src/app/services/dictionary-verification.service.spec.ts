import { TestBed } from '@angular/core/testing';
import { DictionaryVerificationService } from './dictionary-verification.service';

describe('DictionaryVerificationService', () => {
    let service: DictionaryVerificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DictionaryVerificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
