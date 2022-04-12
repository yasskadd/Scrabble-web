import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { Observable } from 'rxjs';

const DEFAULT_DICTIONARY: Dictionary = {
    title: 'Mon dictionnaire',
    description: 'Description de base',
    words: [],
};

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    @ViewChild('file', { static: false }) file: ElementRef;
    @ViewChild('fileError', { static: false }) fileError: ElementRef;
    dictionaries: Dictionary[];
    dictionaryInput: Dictionary;
    myControl = new FormControl();
    filteredOptions: Observable<string[]>;
    form: FormGroup;
    selectedFile: Dictionary | null;
    options: string[];

    constructor(public dictionaryService: DictionaryService, private modifyDictionaryDialog: MatDialog) {
        this.updateDictionaryList();
    }

    isDefault(dictionary: Dictionary) {
        return dictionary.title === 'Mon dictionnaire';
    }

    deleteDictionary(dictionaryToDelete: Dictionary) {
        this.updateDictionaryList();
        this.dictionaryService.deleteDictionary(dictionaryToDelete);
    }

    openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
        const title = dictionaryToModify.title;
        const dialogRef = this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: dictionaryToModify,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.modifyDictionary({ title, newTitle: result.title, newDescription: result.description });
        });
    }

    isUniqueTitle(title: string): boolean {
        return this.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    modifyDictionary(modifiedDictionaryInfo: ModifiedDictionaryInfo) {
        if (modifiedDictionaryInfo.title === '' || modifiedDictionaryInfo.newDescription === '') return;

        this.dictionaryService.getDictionaries();
        if (this.isUniqueTitle(modifiedDictionaryInfo.newTitle)) this.dictionaryService.modifyDictionary(modifiedDictionaryInfo);
    }

    downloadJson(dictionary: Dictionary) {
        this.downloadFile(dictionary);
    }

    resetDictionaries() {
        this.dictionaryService.resetDictionaries();
        this.updateDictionaryList();
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries().then((dictionaries) => {
            this.dictionaries = [DEFAULT_DICTIONARY, ...dictionaries];
        });
    }

    uploadDictionary() {
        this.dictionaryService.uploadDictionary(this.file, this.selectedFile, this.fileError);
    }

    detectImportFile() {
        this.fileError.nativeElement.textContent = '';
        if (this.file.nativeElement.files.length !== 0) this.form.controls.dictionary.disable();
        else {
            this.selectedFile = null;
            this.form.controls.dictionary.enable();
        }
    }

    downloadFile(data: unknown) {
        const json = JSON.stringify(data);
        const blob = new Blob([json] as BlobPart[], { type: 'file/json' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }

    updateImportMessage(message: string, color: string) {
        this.fileError.nativeElement.textContent = message;
        this.fileError.nativeElement.style.color = color;
    }

    resetDictionaryInput() {
        this.dictionaryInput = {} as Dictionary;
    }

    addDictionary() {
        this.updateDictionaryList();
        if (this.isUniqueTitle(this.dictionaryInput.title)) {
            this.dictionaryService.addDictionary(this.dictionaryInput);
        }
        this.resetDictionaryInput();
    }
}
