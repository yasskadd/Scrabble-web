import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogBoxNewGameComponent } from './dialog-box-new-game.component';

const DATA_PLAYER_NAME = 'vincent';

describe('DialogBoxNewGameComponent', () => {
    let component: DialogBoxNewGameComponent;
    let fixture: ComponentFixture<DialogBoxNewGameComponent>;

    const dialogMock = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule, FormsModule],
            declarations: [DialogBoxNewGameComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: DATA_PLAYER_NAME },
                { provide: MatDialogRef, useValue: dialogMock },
            ],
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

    it('dialog should be closed after onYesClick()', () => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['dialogRef'], 'close').and.callThrough();
        component.onNoClick();
        expect(spy).toHaveBeenCalled();
    });
});
