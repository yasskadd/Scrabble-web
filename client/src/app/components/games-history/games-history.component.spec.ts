import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamesHistoryComponent } from './games-history.component';

describe('GamesHistoryComponent', () => {
    let component: GamesHistoryComponent;
    let fixture: ComponentFixture<GamesHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamesHistoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamesHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
