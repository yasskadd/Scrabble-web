import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '@app/services/game-configuration.service';

const enum TimeOptions {
    ThirtySecond = 30,
    OneMinute = 60,
    OneMinuteAndThirty = 90,
    TwoMinute = 120,
    TwoMinuteAndThirty = 150,
    ThreeMinute = 180,
    ThreeMinuteAndThirty = 210,
    FourMinute = 240,
    FourMinuteAndThirty = 270,
    FiveMinute = 300,
}

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    playerName: string;
    timer: number = TimeOptions.OneMinute;
    gameMode: string;
    timerList = [
        TimeOptions.ThirtySecond,
        TimeOptions.OneMinute,
        TimeOptions.OneMinuteAndThirty,
        TimeOptions.TwoMinute,
        TimeOptions.TwoMinuteAndThirty,
        TimeOptions.ThreeMinute,
        TimeOptions.ThreeMinuteAndThirty,
        TimeOptions.FourMinute,
        TimeOptions.FourMinuteAndThirty,
        TimeOptions.FiveMinute,
    ];
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
        const minute = Math.floor(time / TimeOptions.OneMinute);
        const second = time - minute * TimeOptions.OneMinute;

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
