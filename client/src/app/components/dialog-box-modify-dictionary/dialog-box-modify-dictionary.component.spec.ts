import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogBoxModifyDictionaryComponent } from './dialog-box-modify-dictionary.component';

describe('DialogBoxModifyDictionaryComponent', () => {
    let component: DialogBoxModifyDictionaryComponent;
    let fixture: ComponentFixture<DialogBoxModifyDictionaryComponent>;

    const dialogMock = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogBoxModifyDictionaryComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: dialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogBoxModifyDictionaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('dialog should be closed after closeDialog()', () => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['dialogRef'], 'close').and.callThrough();
        component.closeDialog();
        expect(spy).toHaveBeenCalled();
    });
});
