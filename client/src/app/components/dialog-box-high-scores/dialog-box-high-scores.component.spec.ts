import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighScoresService } from '@app/services/high-scores.service';
import { DialogBoxHighScoresComponent } from './dialog-box-high-scores.component';

describe('DialogBoxHighScoresComponent', () => {
    let component: DialogBoxHighScoresComponent;
    let fixture: ComponentFixture<DialogBoxHighScoresComponent>;
    let highScoresServiceSpy: jasmine.SpyObj<HighScoresService>;

    beforeEach(async () => {
        highScoresServiceSpy = jasmine.createSpyObj('HighScoresService', ['getHighScores', 'openSnackBar', 'resetHighScores']);
        await TestBed.configureTestingModule({
            declarations: [DialogBoxHighScoresComponent],
            providers: [{ provide: HighScoresService, useValue: highScoresServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogBoxHighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
