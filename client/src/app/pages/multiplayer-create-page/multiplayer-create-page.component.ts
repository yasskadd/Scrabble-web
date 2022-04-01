import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { DictionaryVerificationService } from '@app/services/dictionary-verification.service';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { TimerService } from '@app/services/timer.service';

const defaultDictionary: Dictionary = { title: 'Francais', description: 'Description de base', words: [] };
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
const BOT_NAME_LIST = ['robert', 'jean', 'albert'];
const TIME_OUT_150 = 150;

@Component({
    selector: 'app-multiplayer-create-page',
    templateUrl: './multiplayer-create-page.component.html',
    styleUrls: ['./multiplayer-create-page.component.scss'],
})
export class MultiplayerCreatePageComponent implements OnInit {
    @ViewChild('info', { static: false }) info: ElementRef;
    @ViewChild('file', { static: false }) file: ElementRef;
    @ViewChild('fileError', { static: false }) fileError: ElementRef;

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
    dictionaryList: Dictionary[];
    selectedFile: Dictionary | null;

    constructor(
        public gameConfiguration: GameConfigurationService,
        public timer: TimerService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private readonly httpHandler: HttpHandlerService,
        private renderer: Renderer2,
        private dictionaryVerification: DictionaryVerificationService,
    ) {
        this.gameMode = this.activatedRoute.snapshot.params.id;
        this.playerName = '';
        this.botName = '';
        this.difficultyList = ['Débutant'];
        this.selectedFile = null;
    }

    ngOnInit(): void {
        this.gameConfiguration.resetRoomInformation();
        const defaultTimer = this.timerList.find((timerOption) => timerOption === TimeOptions.OneMinute);
        this.form = this.fb.group({
            timer: [defaultTimer, Validators.required],
            dictionary: ['Francais', Validators.required],
        });
        this.giveNameToBot();
        this.httpHandler.getDictionaries().subscribe((dictionaries) => (this.dictionaryList = [defaultDictionary].concat(dictionaries)));
    }

    uploadDictionary() {
        if (this.file.nativeElement.files.length !== 0) {
            const selectedFile = this.file.nativeElement.files[0];
            const fileReader = new FileReader();
            fileReader.readAsText(selectedFile, 'UTF-8');
            fileReader.onload = () => {
                const newDictionary = JSON.parse(fileReader.result as string);
                if (this.dictionaryVerification.globalVerification(newDictionary) !== 'Passed') {
                    this.updateImportMessage(this.dictionaryVerification.globalVerification(newDictionary), 'red');
                } else {
                    this.updateImportMessage('Ajout avec succès du nouveau dictionnaire', 'black');
                    this.selectedFile = newDictionary;
                    this.httpHandler.addDictionary(newDictionary).subscribe();
                }
            };
        } else {
            this.updateImportMessage("Il n'y a aucun fichier séléctioné", 'red');
        }
    }

    detectImportFile() {
        this.fileError.nativeElement.textContent = '';
        if (this.file.nativeElement.files.length !== 0) this.form.controls.dictionary.disable();
        else {
            this.selectedFile = null;
            this.form.controls.dictionary.enable();
        }
    }

    updateImportMessage(message: string, color: string) {
        this.fileError.nativeElement.textContent = message;
        this.fileError.nativeElement.style.color = color;
    }

    onMouseOver(dictionary: Dictionary) {
        this.info.nativeElement.children[0].textContent = dictionary.title;
        this.info.nativeElement.children[1].textContent = dictionary.description;
        this.renderer.setStyle(this.info.nativeElement, 'visibility', 'visible');
    }

    onMouseOut() {
        this.renderer.setStyle(this.info.nativeElement, 'visibility', 'hidden');
    }

    onOpen() {
        this.httpHandler.getDictionaries().subscribe((dictionaries) => (this.dictionaryList = [defaultDictionary].concat(dictionaries)));
    }

    giveNameToBot(): void {
        if (this.isSoloMode()) {
            this.createBotName();
        }
    }

    createGame() {
        this.gameConfiguration.gameInitialization({
            username: this.playerName,
            timer: (this.form.get('timer') as AbstractControl).value,
            dictionary: this.getDictionary((this.form.get('dictionary') as AbstractControl).value).words,
            mode: this.gameMode,
            isMultiplayer: this.isSoloMode() ? false : true,
        });
        if (this.isSoloMode()) {
            this.validateName();
            setTimeout(() => {
                this.gameConfiguration.beginScrabbleGame(this.botName);
            }, TIME_OUT_150);
        }
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
        this.botName = BOT_NAME_LIST[Math.floor(Math.random() * BOT_NAME_LIST.length)];
    }

    private resetInput(): void {
        this.playerName = '';
    }

    private validateName(): void {
        while (this.playerName.toLowerCase() === this.botName) {
            this.botName = BOT_NAME_LIST[Math.floor(Math.random() * BOT_NAME_LIST.length)];
        }
    }

    private getDictionary(title: string): Dictionary {
        if (this.selectedFile !== null) return this.selectedFile;
        return this.dictionaryList.find((dictionary) => dictionary.title === title) as Dictionary;
    }
}
