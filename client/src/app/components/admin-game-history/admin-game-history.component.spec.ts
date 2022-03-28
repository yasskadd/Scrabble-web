import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminGameHistoryComponent } from './admin-game-history.component';

describe('AdminGameHistoryComponent', () => {
    let component: AdminGameHistoryComponent;
    let fixture: ComponentFixture<AdminGameHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminGameHistoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminGameHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
