import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';
import * as saver from 'file-saver';
import { of } from 'rxjs';
import { AdminDictionariesComponent } from './admin-dictionaries.component';

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({ action: true }),
        };
    }
}

const DB_DICTIONARY = { _id: '932487fds', title: 'Mon dictionnaire', description: 'Un dictionnaire' };
describe('AdminDictionariesComponent', () => {
    let component: AdminDictionariesComponent;
    let fixture: ComponentFixture<AdminDictionariesComponent>;
    let saveAsSpy: jasmine.Spy<jasmine.Func>;
    let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;

    beforeEach(async () => {
        dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', [
            'deleteDictionary',
            'getDictionaries',
            'addDictionary',
            'modifyDictionary',
            'resetDictionaries',
            'uploadDictionary',
            'getDictionary',
        ]);

        dictionaryServiceSpy.getDictionaries.and.resolveTo([]);
        dictionaryServiceSpy.uploadDictionary.and.resolveTo();
        dictionaryServiceSpy.modifyDictionary.and.resolveTo();
        dictionaryServiceSpy.getDictionary.and.resolveTo({} as Dictionary);

        // eslint-disable-next-line deprecation/deprecation
        saveAsSpy = spyOn(saver, 'saveAs').and.stub();
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                { provide: DictionaryService, useValue: dictionaryServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
            declarations: [AdminDictionariesComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.dictionaryList = [
            {
                title: 'Mon dictionnaire',
                description: 'Description de base',
            },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should download a json', () => {
        component.downloadJson({} as Dictionary);
        expect(dictionaryServiceSpy.getDictionary).toHaveBeenCalled();
    });
    it('should download a file', () => {
        component.downloadFile({} as Dictionary);
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

    // describe('Add dictionary tests', () => {
    //     it('addDictionary() should call dictionaryService.addDictionary() and resetDictionaryInput', () => {
    //         const resetDictionnarySpy = spyOn(component, 'resetDictionaryInput' as never);
    //         component.dictionaryInput = {
    //             title: 'Mon dictionnaire 2',
    //             description: 'Un dictionnaire',
    //             words: ['string'],
    //         };
    //         component.addDictionary();
    //         expect(dictionaryServiceSpy.addDictionary).toHaveBeenCalled();
    //         expect(resetDictionnarySpy).toHaveBeenCalled();
    //     });

    //     it('addDictionary() should not call dictionaryService.addDictionary()  if the title exist already', () => {
    //         const resetDictionnarySpy = spyOn(component, 'resetDictionaryInput' as never);

    //         component.dictionaryInput = {
    //             title: 'Mon dictionnaire',
    //             description: 'Un dictionnaire',
    //             words: ['string'],
    //         };
    //         component.addDictionary();
    //         expect(dictionaryServiceSpy.addDictionary).not.toHaveBeenCalled();
    //         expect(resetDictionnarySpy).toHaveBeenCalled();
    //     });
    //     it('added dictionary should be added to list', () => {});
    // });

    describe('Modify dictionary tests', () => {
        it('openModifyDictionaryDialog() should open dialog box', () => {
            // eslint-disable-next-line dot-notation
            const dialogSpy = spyOn(component['modifyDictionaryDialog'], 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<
                typeof component
            >);
            const spy = spyOn(component, 'modifyDictionary');
            component.openModifyDictionaryDialog({
                title: 'Le dictionnaire larousse',
                description: 'dictionnaire francais',
            });
            expect(dialogSpy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });

        it('modifyDictionary() should call dictionaryService.modifyDictionary()', () => {
            component.modifyDictionary({ title: 'Titre de Base', newTitle: 'Titre Modifier', newDescription: 'Nouvelle Description' });
            expect(dictionaryServiceSpy.modifyDictionary).toHaveBeenCalled();
            expect(dictionaryServiceSpy.getDictionaries).toHaveBeenCalled();
        });

        it('modifyDictionary() should not call updateDictionaryList if the title or the description is blank', () => {
            const spy = spyOn(component, 'updateDictionaryList');

            component.modifyDictionary({ title: '', newTitle: '', newDescription: '' });
            expect(spy).not.toHaveBeenCalled();
        });

        it('modifyDictionary() should not call updateDictionaryList if the title is the same as an other one', () => {
            const spy = spyOn(component, 'updateDictionaryList');

            component.modifyDictionary({ title: 'Mon dictionnaire2', newTitle: 'Mon dictionnaire', newDescription: 'Bonjour' });
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('reset Dictionaries tests', () => {
        it('resetDictionaries() should call dictionaryService.resetDictionaries() and updateDictionaryList()', () => {
            const spy = spyOn(component, 'updateDictionaryList');
            component.resetDictionaries();
            expect(dictionaryServiceSpy.resetDictionaries).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('Upload Dictionnary tests', () => {
        it('uploadDictionary() should call dictionaryService.uploadDictionary()', () => {
            component.uploadDictionary();
            expect(dictionaryServiceSpy.uploadDictionary).toHaveBeenCalled();
        });
    });

    describe('detectImportFile  tests', () => {
        it('detectImportFile() should set textContent of fileError to nothing', () => {
            const message = '';
            component.detectImportFile();
            expect(component.fileError.nativeElement.textContent).toEqual(message);
        });

        it('detectImportFile() should set selectedFile to null if there is a file that is being selected', () => {
            const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
            const dT = new DataTransfer();
            dT.items.add(new File([blob], 'test.json'));
            component.file.nativeElement.files = dT.files;
            component.detectImportFile();
            expect(component.selectedFile).toEqual(null);
        });

        it('selecting a file should call detectImportFile()', fakeAsync(() => {
            const detectImportFileSpy = spyOn(component, 'detectImportFile');
            const input = fixture.debugElement.nativeElement.querySelector('#selectFiles');
            input.dispatchEvent(new Event('change'));
            tick();
            fixture.detectChanges();
            expect(detectImportFileSpy).toHaveBeenCalled();
        }));
        it('updateImportMessage() should set textContent of fileError p with message and text color passed as param', () => {
            const message = 'Message';
            const color = 'red';
            component.updateImportMessage(message, color);
            expect(component.fileError.nativeElement.textContent).toEqual(message);
            expect(component.fileError.nativeElement.style.color).toEqual(color);
        });
    });

    describe('reset DictionaryInput tests', () => {
        it('resetDictionaryInput() should call dictionaryService.resetDictionaries() and updateDictionaryList()', () => {
            const spy = spyOn(component, 'updateDictionaryList');
            component.resetDictionaries();
            expect(dictionaryServiceSpy.resetDictionaries).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });
    });
});
