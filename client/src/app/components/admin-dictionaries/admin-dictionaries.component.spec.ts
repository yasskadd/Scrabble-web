import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';
import * as saver from 'file-saver';
import { AdminDictionariesComponent } from './admin-dictionaries.component';

fdescribe('AdminDictionariesComponent', () => {
    let component: AdminDictionariesComponent;
    let fixture: ComponentFixture<AdminDictionariesComponent>;
    let saveAsSpy: jasmine.Spy<jasmine.Func>;
    let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;

    beforeEach(async () => {
        dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', ['deleteDictionary', 'getDictionaries', 'addDictionary']);
        dictionaryServiceSpy.getDictionaries.and.resolveTo([]);
        // eslint-disable-next-line deprecation/deprecation
        saveAsSpy = spyOn(saver, 'saveAs').and.stub();
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [{ provide: DictionaryService, useValue: dictionaryServiceSpy }],
            declarations: [AdminDictionariesComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.dictionaries = [
            {
                title: 'Mon dictionnaire',
                description: 'Description de base',
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should download a file', () => {
        component.downloadJson({} as Dictionary);
        expect(saveAsSpy).toHaveBeenCalled();
    });

    describe('Default dictionary tests', () => {
        it('isDefault() should return true if the dictionary is the default dictionary', () => {
            expect(
                component.isDefault({
                    title: 'Mon dictionnaire',
                    description: 'Description de base',
                }),
            ).toBeTruthy();
        });

        it('isDefault() should return false if dictionary is not default dictionary', () => {
            expect(
                component.isDefault({
                    title: 'Le dictionnaire larousse',
                    description: 'dictionnaire francais',
                }),
            ).toBeFalsy();
        });

        it('dictionary in list should have buttons if isDefault() returns false', () => {
            spyOn(component, 'isDefault').and.returnValue(false);
            fixture.detectChanges();
            const button = fixture.debugElement.nativeElement.querySelector('.buttonModify');
            expect(button).toBeTruthy();
        });

        it('dictionary in list should not have buttons if isDefault() returns true', () => {
            spyOn(component, 'isDefault').and.returnValue(true);
            fixture.detectChanges();
            const button = fixture.debugElement.nativeElement.querySelector('.buttonModify');
            expect(button).toBeFalsy();
        });
    });

    describe('Delete dictionary tests', () => {
        it('deleteDictionary() should call dictionaryService.deleteDictionary()', () => {
            component.deleteDictionary({
                title: 'Le dictionnaire larousse',
                description: 'dictionnaire francais',
            });
            expect(dictionaryServiceSpy.deleteDictionary).toHaveBeenCalled();
        });

        // it('deleted dictionary should disappear dictionary from list', () => {
        //     component.dictionaries = [
        //         {
        //             title: 'Mon dictionnaire',
        //             description: 'Description de base',
        //         },
        //         {
        //             title: 'Mauvais',
        //             description: 'Mauvais de base',
        //         },
        //     ];

        //     expect(component.dictionaries.length).toEqual(0);
        //     component.deleteDictionary({
        //         title: 'Mauvais',
        //         description: 'Mauvais de base',
        //     });
        //     expect(component.dictionaries.length).toEqual(0);
        // });
    });

    describe('Add dictionary tests', () => {
        it('addDictionary() should call dictionaryService.addDictionary() and resetDictionaryInput', () => {
            const resetDictionnarySpy = spyOn(component, 'resetDictionaryInput' as never);
            component.dictionaryInput = {
                title: 'Mon dictionnaire',
                description: 'Un dictionnaire',
                words: ['string'],
            };
            component.addDictionary();
            expect(dictionaryServiceSpy.addDictionary).toHaveBeenCalled();
            expect(resetDictionnarySpy).toHaveBeenCalled();
        });

        // it('added dictionary should be added to list', () => {});
    });

    describe('Modify dictionary tests', () => {
        it('openModifyDictionaryDialog() should open dialog box', () => {});

        it('modifyDictionary() should call dictionaryService.modifyDictionary()', () => {});

        it('modified dictionary should have a new title and old description if only title is modified', () => {});

        it('modified dictionary should have a new description and old title if only description is modified', () => {});

        it('modified dictionary should have a new title and  description if title and description are modified', () => {});
    });
});
