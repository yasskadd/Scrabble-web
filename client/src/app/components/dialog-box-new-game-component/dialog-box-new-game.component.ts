import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    currentName: string;
    newName: string;
}

@Component({
    selector: 'app-dialog-box-new-game-component',
    templateUrl: './dialog-box-new-game.component.html',
    styleUrls: ['./dialog-box-new-game.component.scss'],
})
export class DialogBoxNewGameComponent {
    constructor(public dialogRef: MatDialogRef<DialogBoxNewGameComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}
    onNoClick(): void {
        this.dialogRef.close();
    }
}
