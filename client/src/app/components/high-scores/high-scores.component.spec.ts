import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpHandlerService } from '@app/services/http-handler.service';
import { of } from 'rxjs';
import { HighScoresComponent } from './high-scores.component';
const TIMEOUT = 3001;
const TEST_ERROR = "Impossible de recevoir l'information du serveur";

describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let fixture: ComponentFixture<HighScoresComponent>;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;
    let matSnackBar: MatSnackBar;
    const mockMatSnackBar = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: () => {},
    };

    beforeEach(async () => {
        httpHandlerSpy = jasmine.createSpyObj('HttpHandlerService', ['getClassicHighScore', 'getLOG2990HighScore']);
        httpHandlerSpy.getClassicHighScore.and.returnValue(
            of([{ _id: '932487fds', username: 'Vincent', type: 'Classique', score: 40, position: '1' }]),
        );
        httpHandlerSpy.getLOG2990HighScore.and.returnValue(
            of([{ _id: '3256987sfdg', username: 'Vincent', type: 'LOG2990', score: 90, position: '4' }]),
        );
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule, MatIconModule],
            declarations: [HighScoresComponent],
            providers: [
                { provide: HttpHandlerService, useValue: httpHandlerSpy },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        matSnackBar = TestBed.inject(MatSnackBar);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getClassicHighScore when calling getMessagesFromServer', () => {
        component.getHighScores();
        expect(httpHandlerSpy.getClassicHighScore).toHaveBeenCalled();
        expect(httpHandlerSpy.getLOG2990HighScore).toHaveBeenCalled();
    });

    it('getHighScores should not call openSnackbar if we receive data from the server after 3 seconds', fakeAsync(() => {
        const spy = spyOn(component, 'openSnackBar');
        component.getHighScores();
        tick(TIMEOUT);
        expect(spy).not.toHaveBeenCalledWith(TEST_ERROR);
    }));

    it('getHighScores should  call openSnackbar if we do not receive data from the server after 3 seconds', fakeAsync(() => {
        const spy = spyOn(component, 'openSnackBar');
        component.getHighScores();
        component.highScoreClassic = undefined;
        component.highScoreLOG29990 = undefined;
        tick(TIMEOUT);
        expect(spy).toHaveBeenCalledWith(TEST_ERROR);
    }));

    it('openSnackBar should call the MatSnackBar open method', () => {
        const matSnackBarSpy = spyOn(matSnackBar, 'open').and.stub();
        component.openSnackBar(TEST_ERROR);
        expect(matSnackBarSpy.calls.count()).toBe(1);
        const args = matSnackBarSpy.calls.argsFor(0);
        expect(args[0]).toBe(TEST_ERROR);
        expect(args[1]).toBe('fermer');
        expect(args[2]).toEqual({
            verticalPosition: 'top',
        });
    });
});
