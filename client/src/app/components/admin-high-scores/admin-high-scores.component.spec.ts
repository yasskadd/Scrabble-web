import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighScoresService } from '@app/services/high-scores.service';
import { AdminHighScoresComponent } from './admin-high-scores.component';

describe('AdminHighScoresComponent', () => {
    let component: AdminHighScoresComponent;
    let fixture: ComponentFixture<AdminHighScoresComponent>;
    let highScoresServiceSpy: jasmine.SpyObj<HighScoresService>;

    beforeEach(async () => {
        highScoresServiceSpy = jasmine.createSpyObj('HighScoresService', ['getHighScores', 'openSnackBar', 'resetHighScores']);

        await TestBed.configureTestingModule({
            declarations: [AdminHighScoresComponent],
            providers: [{ provide: HighScoresService, useValue: highScoresServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminHighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
