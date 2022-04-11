import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';

@Component({
    selector: 'app-dialog-box-modify-dictionary',
    templateUrl: './dialog-box-modify-dictionary.component.html',
    styleUrls: ['./dialog-box-modify-dictionary.component.scss'],
})
export class DialogBoxModifyDictionaryComponent implements OnInit {
    title: string;
    description: string;
    dictionaryToModifyTitle: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dictionaryData: Dictionary,
        private dialogRef: MatDialogRef<DialogBoxModifyDictionaryComponent>,
        private dictionaryService: DictionaryService,
    ) {
        this.dictionaryToModifyTitle = this.title;
    }

    ngOnInit(): void {
        this.title = this.dictionaryData.title;
        this.description = this.dictionaryData.description;
    }

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    modifyDictionary() {
        if (this.title === '' || this.description === '') return;

        this.dictionaryService.getDictionaries();
        if (this.isUniqueTitle(this.title))
            this.dictionaryService.modifyDictionary({
                oldTitle: this.dictionaryToModifyTitle,
                newTitle: this.title,
                newDescription: this.description,
            });
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
