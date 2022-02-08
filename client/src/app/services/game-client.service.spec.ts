import { TestBed } from '@angular/core/testing';
import { GameClientService } from './game-client.service';

describe('GameClientService', () => {
    let service: GameClientService;
    // TODO : TESTS
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('startTimer() should start decrementing the timer', () => {
        const SECOND_TIMEOUT = 1000;
        const TIMER_TEST = { minutes: 5, seconds: 0 };
        const EXPECTED_TIME = { minutes: 4, seconds: 59 };
        service.startTimer(TIMER_TEST);
        setTimeout(() => {
            expect(service.gameTimer.minutes).toEqual(EXPECTED_TIME.minutes);
            expect(service.gameTimer.minutes).toEqual(EXPECTED_TIME.minutes);
        }, SECOND_TIMEOUT);
    });
    it('stopTimer() should stop the timer', () => {
        const TIMER_TEST = { minutes: 5, seconds: 0 };
        const SECOND_TIMEOUT = 1000;
        const EXPECTED_TIME = { minutes: 4, seconds: 59 };
        service.startTimer(TIMER_TEST);
        setTimeout(() => {
            service.stopTimer();
        }, SECOND_TIMEOUT);
        setTimeout(() => {
            expect(service.gameTimer.minutes).toEqual(EXPECTED_TIME.minutes);
            expect(service.gameTimer.minutes).toEqual(EXPECTED_TIME.minutes);
        }, SECOND_TIMEOUT);
    });
});
