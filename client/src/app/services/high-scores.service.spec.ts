import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { HighScoresService } from './high-scores.service';

const TIMEOUT = 3001;
const TEST_ERROR = "Impossible de reçevoir l'information du serveur";

describe('HighScoresService', () => {
    let service: HighScoresService;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;
    let matSnackBar: MatSnackBar;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HighScoresService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // const mockMatSnackBar = {
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function
    //     open: () => {},
    // };

    it('should call getClassicHighScore when calling getMessagesFromServer', () => {
        service.getHighScores();
        expect(httpHandlerSpy.getClassicHighScore).toHaveBeenCalled();
        expect(httpHandlerSpy.getLOG2990HighScore).toHaveBeenCalled();
    });

    it('getHighScores should not call openSnackbar if we receive data from the server after 3 seconds', fakeAsync(() => {
        const spy = spyOn(service, 'openSnackBar');
        service.getHighScores();
        tick(TIMEOUT);
        expect(spy).not.toHaveBeenCalledWith(TEST_ERROR);
    }));

    it('getHighScores should  call openSnackbar if we do not receive data from the server after 3 seconds', fakeAsync(() => {
        const spy = spyOn(service, 'openSnackBar');
        service.getHighScores();
        service.highScoreClassic = undefined;
        service.highScoreLOG29990 = undefined;
        tick(TIMEOUT);
        expect(spy).toHaveBeenCalledWith(TEST_ERROR);
    }));

    it('openSnackBar should call the MatSnackBar open method', () => {
        const matSnackBarSpy = spyOn(matSnackBar, 'open').and.stub();
        service.openSnackBar(TEST_ERROR);
        expect(matSnackBarSpy.calls.count()).toBe(1);
        const args = matSnackBarSpy.calls.argsFor(0);
        expect(args[0]).toBe(TEST_ERROR);
        expect(args[1]).toBe('fermer');
        expect(args[2]).toEqual({
            verticalPosition: 'top',
        });
    });
});
