import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from './client-socket.service';

// TODO : Complete the tests (exemple in socket IO Gitlab from moodle)

describe('ClientSocketService', () => {
    let service: ClientSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
