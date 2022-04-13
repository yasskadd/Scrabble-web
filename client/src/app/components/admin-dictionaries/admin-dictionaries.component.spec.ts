import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import * as saver from 'file-saver';
import { AdminDictionariesComponent } from './admin-dictionaries.component';

fdescribe('AdminDictionariesComponent', () => {
    let component: AdminDictionariesComponent;
    let fixture: ComponentFixture<AdminDictionariesComponent>;
    let saveAsSpy: jasmine.Spy<jasmine.Func>;

    beforeEach(async () => {
        // eslint-disable-next-line deprecation/deprecation
        saveAsSpy = spyOn(saver, 'saveAs').and.stub();
        await TestBed.configureTestingModule({
            declarations: [AdminDictionariesComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should download a file', () => {
        component.downloadJson({} as Dictionary);
        expect(saveAsSpy).toHaveBeenCalled();
    });

    describe('Default dictionary tests', () => {
        it('isDefault() should return true if the dictionary is the default dictionary', () => {});

        it('isDefault() should return false if dictionary is not default dictionary', () => {});

        it('dictionary in list should have buttons if isDefault() returns false', () => {});

        it('dictionary in list should not have buttons if isDefault() returns true', () => {});
    });

    describe('Delete dictionary tests', () => {
        it('deleteDictionary() should call dictionaryService.deleteDictionary()', () => {});

        it('deleted dictionary should disappear dictionary from list', () => {});
    });

    describe('Add dictionary tests', () => {
        it('addDictionary() should call dictionaryService.addDictionary()', () => {});

        it('added dictionary should be added to list', () => {});
    });

    describe('Modify dictionary tests', () => {
        it('openModifyDictionaryDialog() should open dialog box', () => {});

        it('modifyDictionary() should call dictionaryService.modifyDictionary()', () => {});

        it('modified dictionary should have a new title and old description if only title is modified', () => {});

        it('modified dictionary should have a new description and old title if only description is modified', () => {});

        it('modified dictionary should have a new title and  description if title and description are modified', () => {});
    });
});
