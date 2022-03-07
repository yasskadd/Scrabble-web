import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpHandlerService } from '@app/services/http-handler.service';
import { of } from 'rxjs';
import { HighScoresComponent } from './high-scores.component';
describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let fixture: ComponentFixture<HighScoresComponent>;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;

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
            providers: [{ provide: HttpHandlerService, useValue: httpHandlerSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getClassicHighScore when calling getMessagesFromServer', () => {
        component.getHighScores();
        expect(httpHandlerSpy.getClassicHighScore).toHaveBeenCalled();
        expect(httpHandlerSpy.getLOG2990HighScore).toHaveBeenCalled();
    });
});
