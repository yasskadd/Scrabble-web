import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    title: string;
    newTitle: string;
    description: string;
}

@Component({
    selector: 'app-dialog-box-modify-dictionary',
    templateUrl: './dialog-box-modify-dictionary.component.html',
    styleUrls: ['./dialog-box-modify-dictionary.component.scss'],
})
export class DialogBoxModifyDictionaryComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public dictionaryData: DialogData, private dialogRef: MatDialogRef<DialogBoxModifyDictionaryComponent>) {}

    closeDialog() {
        this.dialogRef.close();
    }
}
