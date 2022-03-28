import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogBoxAddDictionaryComponent } from './add-dictionary-dialog-box.component';

describe('DialogBoxAddDictionaryComponent', () => {
    let component: DialogBoxAddDictionaryComponent;
    let fixture: ComponentFixture<DialogBoxAddDictionaryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogBoxAddDictionaryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogBoxAddDictionaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
