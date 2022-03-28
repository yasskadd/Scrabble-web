import { TestBed } from '@angular/core/testing';
import { VirtualPlayersService } from './virtual-players.service';

describe('VirtualPlayersService', () => {
    let service: VirtualPlayersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
