import { TestBed } from '@angular/core/testing';
import { CommandHandlerService } from './command-handler.service';

describe('CommandHandlerService', () => {
    let service: CommandHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommandHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
