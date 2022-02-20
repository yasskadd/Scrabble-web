import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameConfigurationService } from '@app/services/game-configuration.service';

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    playerName: string;
    navigator: Navigator;
    constructor(public gameConfiguration: GameConfigurationService, public router: Router) {}

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
    }
    createGame() {
        this.gameConfiguration.gameInitialization({ username: this.playerName, timer: 60, dictionary: 'francais', mode: 'classique' });
        this.resetInput();
        this.navigatePage();
    }

    navigatePage() {
        this.router.navigate(['/classique/multijoueur/salleAttente']);
    }
    private resetInput() {
        this.playerName = '';
    }
}
