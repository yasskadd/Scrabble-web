import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryInfo, HttpHandlerService } from '@app/services/communication/http-handler.service';
import { DictionaryVerificationService } from '@app/services/dictionary-verification.service';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { TimerService } from '@app/services/timer.service';
import { VirtualPlayersService } from '@app/services/virtual-players.service';

const TIMEOUT_REQUEST = 500;
// const defaultDictionary: Dictionary = { title: 'Francais', description: 'Description de base', words: [] };
const defaultDictionary: DictionaryInfo = { title: 'Francais', description: 'Description de base' };
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
    // dictionaryList: Dictionary[];
    dictionaryList: DictionaryInfo[];
    selectedFile: Dictionary | null;

    constructor(
        public virtualPlayers: VirtualPlayersService,
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
        this.difficultyList = ['Débutant', 'Expert'];
        this.selectedFile = null;
    }

    ngOnInit(): void {
        this.virtualPlayers.getBotNames();
        this.gameConfiguration.resetRoomInformation();
        const defaultTimer = this.timerList.find((timerOption) => timerOption === TimeOptions.OneMinute);
        this.form = this.fb.group({
            timer: [defaultTimer, Validators.required],
            difficultyBot: [this.difficultyList[0], Validators.required],
            dictionary: ['Francais', Validators.required],
        });
        (this.form.get('difficultyBot') as AbstractControl).valueChanges.subscribe(() => {
            this.updateBotList();
        });
        this.updateBotList();
        this.httpHandler.getDictionaries().subscribe((dictionaries) => (this.dictionaryList = [defaultDictionary].concat(dictionaries)));
    }

    async uploadDictionary() {
        if (this.file.nativeElement.files.length !== 0) {
            const selectedFile = this.file.nativeElement.files[0];
            const fileReader = new FileReader();
            const content = await this.readFile(selectedFile, fileReader);
            this.fileOnLoad(content);
        } else {
            this.updateImportMessage("Il n'y a aucun fichier séléctioné", 'red');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileOnLoad(newDictionary: Record<string, unknown>): any {
        if (this.dictionaryVerification.globalVerification(newDictionary) !== 'Passed') {
            this.updateImportMessage(this.dictionaryVerification.globalVerification(newDictionary), 'red');
        } else {
            this.updateImportMessage('Ajout avec succès du nouveau dictionnaire', 'black');
            this.selectedFile = newDictionary as unknown as Dictionary;
            this.httpHandler.addDictionary(this.selectedFile).subscribe();
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

    onMouseOver(dictionary: DictionaryInfo) {
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
        if (this.isSoloMode()) this.validateName();
        this.gameConfiguration.gameInitialization({
            username: this.playerName,
            timer: (this.form.get('timer') as AbstractControl).value,
            dictionary: this.getDictionary((this.form.get('dictionary') as AbstractControl).value).title,
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
        if (this.router.url === `/solo/${this.gameMode}`) return true;
        return false;
    }

    createBotName(): void {
        this.botName =
            (this.form.get('difficultyBot') as AbstractControl).value === 'Débutant'
                ? this.virtualPlayers.beginnerBotNames[Math.floor(Math.random() * this.virtualPlayers.beginnerBotNames.length)].username
                : this.virtualPlayers.expertBotNames[Math.floor(Math.random() * this.virtualPlayers.expertBotNames.length)].username;
    }

    private resetInput(): void {
        this.playerName = '';
    }

    private validateName(): void {
        while (this.playerName.toLowerCase() === this.botName) {
            this.createBotName();
        }
    }

    private getDictionary(title: string): Dictionary {
        if (this.selectedFile !== null) return this.selectedFile;
        return this.dictionaryList.find((dictionary) => dictionary.title === title) as Dictionary;
    }

    private updateBotList(): void {
        this.virtualPlayers.getBotNames();
        setTimeout(() => {
            this.giveNameToBot();
        }, TIMEOUT_REQUEST);
    }

    private async readFile(selectedFile: File, fileReader: FileReader): Promise<Record<string, unknown>> {
        return new Promise((resolve, reject) => {
            fileReader.readAsText(selectedFile, 'UTF-8');
            fileReader.onload = () => {
                resolve(JSON.parse(fileReader.result as string));
            };
            fileReader.onerror = () => {
                reject(Error('File is not a JSON'));
            };
        });
    }
}
