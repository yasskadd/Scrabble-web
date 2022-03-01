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
    timer: number = 60;
    navigator: Navigator;
    gameMode: string;
    timerList = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
    constructor(public gameConfiguration: GameConfigurationService, public router: Router, private activatedRoute: ActivatedRoute) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
    }
    createGame() {
        this.gameConfiguration.gameInitialization({ username: this.playerName, timer: this.timer, dictionary: 'francais', mode: this.gameMode });
        this.resetInput();
        this.navigatePage();
    }

    navigatePage() {
        this.router.navigate([`/multijoueur/salleAttente/${this.gameMode}`]);
    }
    secondToMinute(time: number): string {
        const minute = Math.floor(time / 60);
        const second = time - minute * 60;

        if (second === 0) {
            return minute.toString() + ':00 minutes';
        } else {
            return minute.toString() + ':30 minutes';
        }
    }
    private resetInput() {
        this.playerName = '';
    }
}
