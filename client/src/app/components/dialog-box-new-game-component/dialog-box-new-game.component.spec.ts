import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogBoxNewGameComponent } from './dialog-box-new-game.component';

describe('DialogBoxNewGameComponent', () => {
    let component: DialogBoxNewGameComponent;
    let fixture: ComponentFixture<DialogBoxNewGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogBoxNewGameComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogBoxNewGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
