import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-box-game-type',
    templateUrl: './dialog-box-game-type.component.html',
    styleUrls: ['./dialog-box-game-type.component.scss'],
})
export class DialogBoxGameTypeComponent implements OnInit {
    multiplayerCreateLink: string;
    multiplayerjoinLink: string;
    singleplayerLink: string;
    gameMode: string;

    constructor(@Inject(MAT_DIALOG_DATA) private data: string, private dialogRef: MatDialogRef<DialogBoxGameTypeComponent>) {}
    ngOnInit(): void {
        this.gameMode = this.data;
        this.multiplayerCreateLink = `/multijoueur/creer/${this.data}`;
        this.multiplayerjoinLink = `/multijoueur/rejoindre/${this.gameMode}`;
        this.singleplayerLink = `/solo/${this.gameMode}`;
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
