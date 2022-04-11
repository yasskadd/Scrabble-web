import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';

const DEFAULT = ''; // TODO

@Component({
    selector: 'app-dialog-box-modify-dictionary',
    templateUrl: './dialog-box-modify-dictionary.component.html',
    styleUrls: ['./dialog-box-modify-dictionary.component.scss'],
})
export class DialogBoxModifyDictionaryComponent implements OnInit {
    title: string;
    description: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) public dictionaryData: Dictionary,
        private dialogRef: MatDialogRef<DialogBoxModifyDictionaryComponent>,
        private dictionaryService: DictionaryService,
    ) {}

    ngOnInit(): void {
        this.title = this.dictionaryData.title;
        this.description = this.dictionaryData.description;
    }

    onTitleChange(newTitle: string) {
        this.title = newTitle;
    }

    onDescriptionChange(newDescription: string) {
        this.description = newDescription;
    }

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }

    dictionaryIsUnchanged(currentDictionary: Dictionary, newDictionary: Dictionary) {
        return newDictionary.title === currentDictionary.title && newDictionary.description === currentDictionary.description;
    }

    modifyDictionary(currentDictionary: Dictionary, newDictionary: Dictionary) {
        if (this.dictionaryIsUnchanged(currentDictionary, newDictionary)) return;
        this.updateDictionaryList();
        if (newDictionary.title === DEFAULT) return;
        if (this.isUniqueTitle(newDictionary.title)) this.dictionaryService.modifyDictionary(currentDictionary, newDictionary);
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
