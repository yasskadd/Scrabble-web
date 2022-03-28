import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import * as constants from '@app/constants/game';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { TimerService } from '@app/services/timer.service';

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
const BOT_EXPERT_NAME_LIST = ['ScrabbleMaster', 'Spike Spiegel', 'XXDarkLegendXX'];

const BOT_BEGINNER_NAME_LIST = ['paul', 'marc', 'robert'];

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    botName: string;
    playerName: string;
    form: FormGroup;
    gameMode: string;
    difficultyList: string[];
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
        public timer: TimerService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
        this.playerName = '';
        this.botName = '';
        this.difficultyList = ['Débutant', 'Expert'];
    }

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
        const defaultTimer = this.timerList.find((timerOption) => timerOption === TimeOptions.OneMinute);
        this.form = this.fb.group({
            timer: [defaultTimer, Validators.required],
            difficultyBot: [this.difficultyList[0], Validators.required],
        });
        (this.form.get('difficultyBot') as AbstractControl).valueChanges.subscribe(() => {
            this.giveNameToBot();
        });
        this.giveNameToBot();
    }

    giveNameToBot(): void {
        if (this.isSoloMode()) {
            this.createBotName();
        }
    }

    createGame() {
        if (this.isSoloMode()) this.validateName();
        this.gameConfiguration.gameInitialization({
            username: this.playerName,
            timer: (this.form.get('timer') as AbstractControl).value,
            dictionary: 'francais',
            mode: this.gameMode,
            isMultiplayer: this.isSoloMode() ? false : true,
            opponent: this.isSoloMode() ? this.botName : undefined,
            botDifficulty: this.isSoloMode() ? (this.form.get('difficultyBot') as AbstractControl).value : undefined,
        });
        this.resetInput();
        this.navigatePage();
    }

    navigatePage() {
        if (this.isSoloMode()) this.router.navigate(['/game']);
        else this.router.navigate([`/multijoueur/salleAttente/${this.gameMode}`]);
    }

    isSoloMode() {
        if (this.router.url === '/solo/classique') return true;
        return false;
    }

    createBotName(): void {
        if ((this.form.get('difficultyBot') as AbstractControl).value === 'Débutant') {
            this.botName = BOT_BEGINNER_NAME_LIST[Math.floor(Math.random() * BOT_BEGINNER_NAME_LIST.length)];
            return;
        }
        this.botName = BOT_EXPERT_NAME_LIST[Math.floor(Math.random() * BOT_EXPERT_NAME_LIST.length)];
    }

    private resetInput(): void {
        this.playerName = '';
    }

    private validateName(): void {
        if ((this.form.get('difficultyBot') as AbstractControl).value === 'Débutant') {
            while (this.playerName.toLowerCase() === this.botName) {
                this.botName = BOT_BEGINNER_NAME_LIST[Math.floor(Math.random() * BOT_BEGINNER_NAME_LIST.length)];
            }
            return;
        }
        while (this.playerName.toLowerCase() === this.botName) {
            this.botName = BOT_EXPERT_NAME_LIST[Math.floor(Math.random() * BOT_EXPERT_NAME_LIST.length)];
        }
    }
}
