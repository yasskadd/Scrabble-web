import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '@app/services/game-configuration.service';

@Component({
    selector: 'app-multiplayer-join-page',
    templateUrl: './multiplayer-join-page.component.html',
    styleUrls: ['./multiplayer-join-page.component.scss'],
})
export class MultiplayerJoinPageComponent implements OnInit {
    playerName: string;
    gameMode: string;
    constructor(
        public gameConfiguration: GameConfigurationService,
        public router: Router,
        public snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.listenToServerResponse();
        this.gameConfiguration.resetRoomInformation();
        this.gameConfiguration.joinPage();
    }

    get availableRooms() {
        return this.gameConfiguration.availableRooms;
    }

    joinRoom(roomId: string) {
        this.gameConfiguration.joinGame(roomId, this.playerName);
        this.playerName = '';
    }
    joinRandomGame() {
        this.gameConfiguration.joinRandomRoom(this.playerName);
        this.playerName = '';
    }

    listenToServerResponse() {
        this.gameConfiguration.isRoomJoinable.subscribe((value) => {
            if (value) this.navigatePage();
        });
        this.gameConfiguration.errorReason.subscribe((reason) => {
            if (reason !== '') {
                this.openSnackBar(reason);
            }
        });
    }

    navigatePage() {
        this.router.navigate([`/multijoueur/salleAttente/${this.gameMode}`]);
    }
    openSnackBar(reason: string): void {
        this.snackBar.open(reason, 'fermer', {
            verticalPosition: 'top',
        });
    }
}
