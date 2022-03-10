import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-box',
    templateUrl: './dialog-box.component.html',
    styleUrls: ['./dialog-box.component.scss'],
})
export class DialogBoxComponent implements OnInit {
    multiplayerCreateLink: string;
    multiplayerjoinLink: string;
    singleplayerLink: string;
    gameMode: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string, private dialogRef: MatDialogRef<DialogBoxComponent>) {}
    ngOnInit(): void {
        this.gameMode = this.data;
        // this.multiplayerCreateLink = '/game';
        this.multiplayerCreateLink = `/multijoueur/creer/${this.data}`;
        this.multiplayerjoinLink = `/multijoueur/rejoindre/${this.gameMode}`;
        this.singleplayerLink = `/solo/${this.gameMode}`;
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
