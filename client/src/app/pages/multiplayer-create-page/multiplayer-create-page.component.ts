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
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    playerName: string;
    form: FormGroup;
    navigator: Navigator;
    gameMode: string;
    difficultyList = ['Débutant'];
    botNameList = ['robert', 'jean', 'albert'];
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
    constructor(
        public gameConfiguration: GameConfigurationService,
        public router: Router,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
    }

    ngOnInit(): void {
        // Get current route to instantiate solo from multiplayer
        this.gameConfiguration.resetRoomInformation();
        const defaultTimer = this.timerList.find((timerOption) => timerOption === TimeOptions.OneMinute);
        this.form = this.fb.group({
            timer: [defaultTimer, Validators.required],
        });
    }
    createGame() {
        this.gameConfiguration.gameInitialization({
            username: this.playerName,
            timer: this.form.get('timer')?.value,
            dictionary: 'francais',
            mode: this.gameMode,
            isMultiplayer: this.isSoloMode() ? false : true,
        });
        if (this.isSoloMode()) {
            setTimeout(() => {
                this.gameConfiguration.beginScrabbleGame(this.createBotName());
            }, 0);
        }
        this.resetInput();
        this.navigatePage();
    }

    navigatePage() {
        if (this.isSoloMode()) this.router.navigate(['/game']);
        else this.router.navigate([`/multijoueur/salleAttente/${this.gameMode}`]);
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
    isSoloMode() {
        if (this.router.url === '/solo/classique') return true;
        return false;
    }
    private resetInput() {
        this.playerName = '';
    }

    private createBotName(): string {
        const indexName: number = this.botNameList.indexOf(this.playerName.toLowerCase());
        if (indexName !== -1) this.botNameList.splice(indexName, 1);
        return this.botNameList[Math.floor(Math.random() * this.botNameList.length)];
    }
}
