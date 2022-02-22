import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '@app/services/game-configuration.service';

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    playerName: string;
    navigator: Navigator;
    gameMode: string;
    constructor(public gameConfiguration: GameConfigurationService, public router: Router, private activatedRoute: ActivatedRoute) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
    }
    createGame() {
        this.gameConfiguration.gameInitialization({ username: this.playerName, timer: 60, dictionary: 'francais', mode: this.gameMode });
        this.resetInput();
        this.navigatePage();
    }

    navigatePage() {
        this.router.navigate([`/multijoueur/salleAttente/${this.gameMode}`]);
    }
    private resetInput() {
        this.playerName = '';
    }
}
