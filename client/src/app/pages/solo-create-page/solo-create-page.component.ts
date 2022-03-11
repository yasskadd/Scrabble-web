import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    selector: 'app-solo-create-page',
    templateUrl: './solo-create-page.component.html',
    styleUrls: ['./solo-create-page.component.scss'],
})
export class SoloCreatePageComponent implements OnInit {
    playerName: string;
    form: FormGroup;
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

    botsNameList = []

    difficultyList = ['Débutant'];
    constructor(
        public gameConfiguration: GameConfigurationService,
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
        const defaultTimer = this.timerList.find((timerOption) => timerOption === TimeOptions.OneMinute);
        this.form = this.fb.group({
            timer: [defaultTimer, Validators.required],
        });
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

    createGame() {
        this.gameConfiguration.gameInitialization({
            username: this.playerName,
            opponent: 
            timer: this.form.get('timer')?.value,
            dictionary: 'francais',
            mode: this.gameMode,
            isMultiplayer: false
        });
    }


}
