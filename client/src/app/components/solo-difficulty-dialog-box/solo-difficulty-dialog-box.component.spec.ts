import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoloDifficultyDialogBoxComponent } from './solo-difficulty-dialog-box.component';

describe('SoloDifficultyDialogBoxComponent', () => {
    let component: SoloDifficultyDialogBoxComponent;
    let fixture: ComponentFixture<SoloDifficultyDialogBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloDifficultyDialogBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloDifficultyDialogBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
