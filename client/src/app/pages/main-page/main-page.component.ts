import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '@app/components/dialog-box/dialog-box.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogReference = this.dialog.open(DialogBoxComponent, {});

        dialogReference.afterClosed().subscribe();
    }
}
