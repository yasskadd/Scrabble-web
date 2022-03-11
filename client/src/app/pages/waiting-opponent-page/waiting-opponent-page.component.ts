import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SoloDifficultyDialogBoxComponent } from '@app/components/solo-difficulty-dialog-box/solo-difficulty-dialog-box.component';
import { GameConfigurationService } from '@app/services/game-configuration.service';

@Component({
    selector: 'app-waiting-opponent-page',
    templateUrl: './waiting-opponent-page.component.html',
    styleUrls: ['./waiting-opponent-page.component.scss'],
})
export class WaitingOpponentPageComponent implements OnInit {
    gameMode: string;
    private readonly dialogWidth: string = '40%';
    private readonly dialogHeight: string = '30%';
    constructor(
        public gameConfiguration: GameConfigurationService,
        public router: Router,
        public snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.listenToServerResponse();
    }

    listenToServerResponse() {
        this.gameConfiguration.errorReason.subscribe((reason) => {
            if (reason !== '') {
                this.openSnackBar(reason);
                this.exitRoom();
            }
            this.exitRoom(false);
        });

        this.gameConfiguration.isGameStarted.subscribe((value) => {
            if (value) {
                this.joinGamePage();
            }
        });
    }

    soloMode() {
        this.gameConfiguration.setGameUnavailable();
        this.dialog.open(SoloDifficultyDialogBoxComponent, {
            width: this.dialogWidth,
            height: this.dialogHeight,
            panelClass: 'soloDifficulty',
            disableClose: true,
        });
    }

    rejectOpponent() {
        this.gameConfiguration.rejectOpponent();
    }

    startGame() {
        this.gameConfiguration.beginScrabbleGame();
    }

    joinGamePage() {
        this.router.navigate(['/game']);
    }
    exitRoom(exitByIsOwn?: boolean) {
        if (this.gameConfiguration.roomInformation.isCreator) {
            this.router.navigate([`/multijoueur/creer/${this.gameMode}`]);
            this.gameConfiguration.removeRoom();
        } else {
            this.router.navigate([`/multijoueur/rejoindre/${this.gameMode}`]);
            if (!exitByIsOwn) return;
            this.gameConfiguration.exitWaitingRoom();
        }
    }
    openSnackBar(reason: string): void {
        this.snackBar.open(reason, 'fermer', {
            verticalPosition: 'top',
        });
    }
}
