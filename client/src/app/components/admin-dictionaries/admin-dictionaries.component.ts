import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryInfo } from '@app/interfaces/dictionary-info';
import { DictionaryService } from '@app/services/dictionary.service';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import * as FileSaver from 'file-saver';

const DEFAULT_DICTIONARY: DictionaryInfo = {
    title: 'Mon dictionnaire',
    description: 'Description de base',
};

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    @ViewChild('file', { static: false }) file: ElementRef;
    @ViewChild('fileError', { static: false }) fileError: ElementRef;

    selectedFile: Dictionary | null;
    dictionaries: DictionaryInfo[];
    dictionaryInput: Dictionary;

    constructor(public dictionaryService: DictionaryService, private modifyDictionaryDialog: MatDialog) {
        this.selectedFile = null;
        this.updateDictionaryList();
    }

    isDefault(dictionary: DictionaryInfo) {
        return dictionary.title === 'Mon dictionnaire';
    }

    deleteDictionary(dictionaryToDelete: DictionaryInfo) {
        this.dictionaryService.deleteDictionary(dictionaryToDelete);
        this.updateDictionaryList();
    }

    openModifyDictionaryDialog(dictionaryToModify: DictionaryInfo) {
        const dialogRef = this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: { title: dictionaryToModify.title, newTitle: dictionaryToModify.title, description: dictionaryToModify.description },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.modifyDictionary({ title: dictionaryToModify.title, newTitle: result.title, newDescription: result.description });
        });
    }

    isUniqueTitle(title: string): boolean {
        return this.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    modifyDictionary(modifiedDictionaryInfo: ModifiedDictionaryInfo) {
        if (modifiedDictionaryInfo.newTitle === '' || modifiedDictionaryInfo.newDescription === '') return;
        this.dictionaryService.getDictionaries();
        if (!(modifiedDictionaryInfo.title === modifiedDictionaryInfo.newTitle || !this.isUniqueTitle(modifiedDictionaryInfo.newTitle))) return;
        this.dictionaryService.modifyDictionary(modifiedDictionaryInfo);
        this.updateDictionaryList();
    }

    downloadJson(dictionary: DictionaryInfo) {
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
        this.dictionaryService.uploadDictionary(null, this.file, this.selectedFile, this.fileError);
    }

    detectImportFile() {
        this.fileError.nativeElement.textContent = '';
        if (this.file.nativeElement.files.length === 0) {
            this.selectedFile = null;
        }
    }

    downloadFile(data: unknown) {
        const json = JSON.stringify(data);
        const blob = new Blob([json] as BlobPart[], { type: 'text/json' });
        FileSaver.saveAs(blob, `${(data as Dictionary).title}.json`);
    }

    updateImportMessage(message: string, color: string) {
        this.fileError.nativeElement.textContent = message;
        this.fileError.nativeElement.style.color = color;
    }

    resetDictionaryInput() {
        //     this.dictionaryService.resetDictionaries();
        //     this.updateDictionaryList();
    }

    addDictionary() {
        if (!this.isUniqueTitle(this.dictionaryInput.title)) {
            this.dictionaryService.addDictionary(this.dictionaryInput);
        }
        this.resetDictionaryInput();
    }
}
