import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-box',
    templateUrl: './dialog-box.component.html',
    styleUrls: ['./dialog-box.component.scss'],
})
export class DialogBoxComponent implements OnInit {
    gameMode: string;
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
    ngOnInit(): void {
        this.gameMode = this.data;
    }
}
