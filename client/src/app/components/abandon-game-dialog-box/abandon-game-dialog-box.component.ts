import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GameClientService } from '@app/services/game-client.service';
@Component({
    selector: 'app-abandon-game-dialog-box',
    templateUrl: './abandon-game-dialog-box.component.html',
    styleUrls: ['./abandon-game-dialog-box.component.scss'],
})
export class AbandonGameDialogBoxComponent {
    constructor(private gameclient: GameClientService, private router: Router, private snackBar: MatSnackBar) {}

    abandonGame() {
        this.gameclient.abandonGame();
        this.router.navigate(['/home']);
        this.openSnackBar();
    }

    openSnackBar(): void {
        this.snackBar.open('Vous avez abandonné la partie', 'fermer', {
            verticalPosition: 'top',
        });
    }
}
