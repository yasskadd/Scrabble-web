import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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

const botNameList = ['robert', 'jean', 'albert'];

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    botName: string;
    playerName: string;
    form: FormGroup;
    navigator: Navigator;
    gameMode: string;
    difficultyList = ['Débutant'];
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
        public snackBar: MatSnackBar,
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
        this.giveNameToBot();
    }

    giveNameToBot(): void {
        if (this.isSoloMode()) {
            this.createBotName();
        }
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
            if (!this.validateName()) return;
            setTimeout(() => {
                this.gameConfiguration.beginScrabbleGame(this.botName);
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

    createBotName(): void {
        this.botName = botNameList[Math.floor(Math.random() * botNameList.length)];
    }

    openSnackBar(reason: string): void {
        this.snackBar.open(reason, 'fermer', {
            verticalPosition: 'top',
        });
    }

    private resetInput(): void {
        this.playerName = '';
    }

    private validateName(): boolean {
        if (this.botName !== this.playerName) return true;
        this.resetInput();
        this.openSnackBar('Vous avez le même nom que le Joueur Virtuelle');
        return false;
    }
}
