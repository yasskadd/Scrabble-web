import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';

@Component({
    selector: 'app-dialog-box-modify-dictionary',
    templateUrl: './dialog-box-modify-dictionary.component.html',
    styleUrls: ['./dialog-box-modify-dictionary.component.scss'],
})
export class DialogBoxModifyDictionaryComponent implements OnInit {
    title: string;
    description: string;
    constructor(@Inject(MAT_DIALOG_DATA) public dictionaryData: Dictionary, private dialogRef: MatDialogRef<DialogBoxModifyDictionaryComponent>) {}
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
    closeDialog() {
        this.dialogRef.close();
    }
}
