import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DictionaryService } from '@app/services/dictionary.service';
import { DialogBoxModifyDictionaryComponent } from './dialog-box-modify-dictionary.component';

// const DICTIONARIES: DictionaryInfo[] = [
//     { title: 'Title1', description: 'description1' },
//     { title: 'Title2', description: 'description2' },
//     { title: 'Title3', description: 'description3' },
//     { title: 'Title4', description: 'description4' },
//     { title: 'Title5', description: 'description5' },
//     { title: 'Title6', description: 'description6' },
//     { title: 'Title7', description: 'description7' },
// ];

describe('DialogBoxModifyDictionaryComponent', () => {
    let component: DialogBoxModifyDictionaryComponent;
    let fixture: ComponentFixture<DialogBoxModifyDictionaryComponent>;
    let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogBoxModifyDictionaryComponent],
            providers: [
                { provide: DictionaryService, useValue: dictionaryServiceSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogBoxModifyDictionaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', [
            'getDictionaries',
            'getDictionaries',
            'addDictionary',
            'modifyDictionary',
            'deleteDictionary',
            'resetDictionaries',
        ]);

        // dictionaryServiceSpy.dictionaries = DICTIONARIES; // TODO : make this work!!
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // fit('should return false if dictionary title already exists', () => {
    //     const newTitle = 'Title1';
    //     expect(component.isUniqueTitle(newTitle)).toBeFalsy();
    // });

    // fit('should return true if dictionary title does not already exists', () => {
    //     const newTitle = 'Title8';
    //     expect(component.isUniqueTitle(newTitle)).toBeFalsy();
    // });
});
