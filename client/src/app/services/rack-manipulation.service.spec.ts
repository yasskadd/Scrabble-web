import { TestBed } from '@angular/core/testing';
import { RackManipulationService } from './rack-manipulation.service';

describe('RackManipulationService', () => {
    let service: RackManipulationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RackManipulationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
