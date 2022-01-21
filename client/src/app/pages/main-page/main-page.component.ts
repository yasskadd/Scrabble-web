import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '@app/components/dialog-box/dialog-box.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = "Bienvenue au jeu Scrabble de l'équipe 107";

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogReference = this.dialog.open(DialogBoxComponent, {
            width: '300px',
        });

        dialogReference.afterClosed().subscribe();
    }
}
