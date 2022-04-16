/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
// eslint-disable-next-line max-classes-per-file
import { Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Renderer2, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { DictionaryVerificationService } from '@app/services/dictionary-verification.service';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { VirtualPlayersService } from '@app/services/virtual-players.service';
import { of } from 'rxjs';
import { MultiplayerCreatePageComponent } from './multiplayer-create-page.component';

@Component({
    template: '',
})
export class StubComponent {}

const BOT_EXPERT_LIST = [
    {
        username: 'Paul',
        difficulty: 'Expert',
    },
    {
        username: 'MARC',
        difficulty: 'Expert',
    },
    {
        username: 'Luc',
        difficulty: 'Expert',
    },
    {
        username: 'Jean',
        difficulty: 'Expert',
    },
    {
        username: 'Charles',
        difficulty: 'Expert',
    },
];

const BOT_BEGINNER_LIST = [
    {
        username: 'Paul',
        difficulty: 'debutant',
    },
    {
        username: 'MARC',
        difficulty: 'debutant',
    },
    {
        username: 'Luc',
        difficulty: 'debutant',
    },
    {
        username: 'Jean',
        difficulty: 'debutant',
    },
    {
        username: 'Jules',
        difficulty: 'debutant',
    },
];

const MULTIPLAYER_WAITING_ROOM_ROUTE = 'multijoueur/salleAttente/classique';
const SOLO_MODE = 'solo/classique';
const CREATE_MULTIPLAYER_GAME = 'multijoueur/creer/classique';
const RETURN_ROUTE = 'home';
const GAME_ROUTE = 'game';
const DB_DICTIONARY = { _id: '932487fds', title: 'Mon dictionnaire', description: 'Un dictionnaire' };

describe('MultiplayerCreatePageComponent', () => {
    let component: MultiplayerCreatePageComponent;
    let fixture: ComponentFixture<MultiplayerCreatePageComponent>;
    let location: Location;
    let router: Router;
    let gameConfigurationServiceSpy: jasmine.SpyObj<GameConfigurationService>;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;
    let dictionaryVerificationSpy: jasmine.SpyObj<DictionaryVerificationService>;
    let virtualPlayersServiceSpy: jasmine.SpyObj<VirtualPlayersService>;
    let renderer2: Renderer2;
    let setStyleSpy: unknown;

    const mockMatSnackBar = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: () => {},
    };

    beforeEach(async () => {
        gameConfigurationServiceSpy = jasmine.createSpyObj('GameConfigurationService', [
            'gameInitialization',
            'resetRoomInformation',
            'beginScrabbleGame',
            'importDictionary',
        ]);

        httpHandlerSpy = jasmine.createSpyObj('HttpHandlerService', ['getDictionaries', 'addDictionary']);
        httpHandlerSpy.getDictionaries.and.returnValue(of([DB_DICTIONARY]));
        httpHandlerSpy.addDictionary.and.returnValue(of({} as unknown as void));

        dictionaryVerificationSpy = jasmine.createSpyObj('DictionaryVerificationService', ['globalVerification']);

        virtualPlayersServiceSpy = jasmine.createSpyObj('VirtualPlayersService', ['getBotNames'], {
            beginnerBotNames: BOT_BEGINNER_LIST,
            expertBotNames: BOT_EXPERT_LIST,
        });

        await TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                BrowserAnimationsModule,
                MatInputModule,
                MatFormFieldModule,
                MatSelectModule,
                MatOptionModule,
                MatIconModule,
                MatCardModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes([
                    { path: MULTIPLAYER_WAITING_ROOM_ROUTE, component: StubComponent },
                    { path: RETURN_ROUTE, component: StubComponent },
                    { path: SOLO_MODE, component: StubComponent },
                    { path: CREATE_MULTIPLAYER_GAME, component: StubComponent },
                    { path: GAME_ROUTE, component: StubComponent },
                ]),
            ],

            declarations: [MultiplayerCreatePageComponent],
            providers: [
                { provide: GameConfigurationService, useValue: gameConfigurationServiceSpy },
                { provide: MatSnackBar, useValue: mockMatSnackBar },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                id: 'classique',
                            },
                        },
                    },
                },
                { provide: FormBuilder },
                { provide: Renderer2 },
                { provide: HttpHandlerService, useValue: httpHandlerSpy },
                { provide: DictionaryVerificationService, useValue: dictionaryVerificationSpy },
                { provide: VirtualPlayersService, useValue: virtualPlayersServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(MultiplayerCreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        location = TestBed.inject(Location);
        renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
        setStyleSpy = spyOn(renderer2, 'setStyle').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // eslint-disable-next-line max-len
    it('uploadDictionary() should call fileOnLoad if there is a selected file to upload', async () => {
        const messageSpy = spyOn(component, 'fileOnLoad');
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        dT.items.add(new File([blob], 'test.json'));
        component.file.nativeElement.files = dT.files;

        dictionaryVerificationSpy.globalVerification.and.callFake(async () => 'Did not passed');
        await component.uploadDictionary();
        expect(messageSpy).toHaveBeenCalled();
    });

    it('uploadDictionary() should set textContent of fileError with no file selected message if there is no selected file to upload', () => {
        const messageSpy = spyOn(component, 'updateDictionaryMessage');
        component.uploadDictionary();
        expect(messageSpy).toHaveBeenCalledWith("Il n'y a aucun fichier séléctioné", 'red');
    });

    // eslint-disable-next-line max-len
    it('fileOnLoad() should call addDictionary of HttpHandlerService if file selected passed globalVerification of DictionaryVerificationService', fakeAsync(() => {
        const messageSpy = spyOn(component, 'updateDictionaryMessage');
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        dT.items.add(new File([blob], 'test.json'));
        component.file.nativeElement.files = dT.files;
        dictionaryVerificationSpy.globalVerification.and.callFake(async () => 'Passed');
        component.fileOnLoad({});
        tick(5000);
        expect(messageSpy).toHaveBeenCalledWith('Ajout avec succès du nouveau dictionnaire', 'black');
        expect(httpHandlerSpy.addDictionary).toHaveBeenCalled();
    }));

    // eslint-disable-next-line max-len
    it('fileOnLoad() should call updateImportMessage with error message if file selected did not pass globalVerification of DictionaryVerificationService', fakeAsync(() => {
        const messageSpy = spyOn(component, 'updateDictionaryMessage');
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        dT.items.add(new File([blob], 'test.json'));
        component.file.nativeElement.files = dT.files;
        dictionaryVerificationSpy.globalVerification.and.callFake(async () => 'Did not passed');
        component.fileOnLoad({});
        tick(5000);
        expect(messageSpy).toHaveBeenCalledWith('Did not passed', 'red');
    }));

    it('clicking on import button should call uploadDictionary()', fakeAsync(() => {
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        dT.items.add(new File([blob], 'test.json'));
        component.file.nativeElement.files = dT.files;
        const uploadDictionarySpy = spyOn(component, 'uploadDictionary');
        const button = fixture.debugElement.nativeElement.querySelector('#import');
        button.click();
        tick();
        fixture.detectChanges();
        expect(uploadDictionarySpy).toHaveBeenCalled();
    }));

    it('detectImportFile() should disable dictionary select options if a file has been selected', () => {
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        const disableSpy = spyOn(component.form.controls.dictionary, 'disable');
        dT.items.add(new File([blob], 'test.json'));
        component.file.nativeElement.files = dT.files;
        component.detectImportFile();
        expect(disableSpy).toHaveBeenCalled();
    });

    it('detectImportFile() should set textContent of fileError to nothing', () => {
        const message = '';
        component.detectImportFile();
        expect(component.fileError.nativeElement.textContent).toEqual(message);
    });

    it('selecting a file should call detectImportFile()', fakeAsync(() => {
        const detectImportFileSpy = spyOn(component, 'detectImportFile');
        const input = fixture.debugElement.nativeElement.querySelector('#selectFiles');
        input.dispatchEvent(new Event('change'));
        tick();
        fixture.detectChanges();
        expect(detectImportFileSpy).toHaveBeenCalled();
    }));

    it('updateImportMessage() should set textContent of fileError p with message and text color passed as param', () => {
        const message = 'Message';
        const color = 'red';
        component.updateDictionaryMessage(message, color);
        expect(component.fileError.nativeElement.textContent).toEqual(message);
        expect(component.fileError.nativeElement.style.color).toEqual(color);
    });

    it('onMouseOver() should set textContent of info panel with title and description of the dictionary passed as param', () => {
        component.onMouseOver(DB_DICTIONARY);
        expect(component.info.nativeElement.children[0].textContent).toEqual(DB_DICTIONARY.title);
        expect(component.info.nativeElement.children[1].textContent).toEqual(DB_DICTIONARY.description);
    });

    it('onMouseOver() should call setStyle of Renderer2 and show dictionary info panel', () => {
        component.onMouseOver(DB_DICTIONARY);
        expect(setStyleSpy).toHaveBeenCalledWith(component.info.nativeElement, 'visibility', 'visible');
    });

    it('onMouseOut() should call setStyle of Renderer2 and hide dictionary info panel', () => {
        component.onMouseOut();
        expect(setStyleSpy).toHaveBeenCalledWith(component.info.nativeElement, 'visibility', 'hidden');
    });

    it('onOpen() should call getDictionaries() of HttpHandlerService', () => {
        component.onOpen();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('onOpen() should set dictionaryList', () => {
        component.dictionaryList = [];
        component.onOpen();
        expect(component.dictionaryList.length).not.toEqual(0);
    });

    it('navigatePage should redirect to salleAttente when we create a multiplayer Game', fakeAsync(() => {
        const expectedURL = '/' + MULTIPLAYER_WAITING_ROOM_ROUTE;
        component.navigatePage();
        tick();
        fixture.detectChanges();
        expect(location.path()).toEqual(expectedURL);
    }));

    it('navigatePage should redirect to game when we create a solo Game', fakeAsync(() => {
        const expectedURL = '/' + GAME_ROUTE;
        router.navigateByUrl(SOLO_MODE);
        tick();
        component.navigatePage();
        tick();
        fixture.detectChanges();
        expect(location.path()).toEqual(expectedURL);
    }));

    it('using path solo/classique to navigate to this page should return true in the soloMode()', fakeAsync(() => {
        router.navigateByUrl(SOLO_MODE);
        component.isSoloMode();
        tick();
        fixture.detectChanges();
        expect(component.isSoloMode()).toEqual(true);
    }));

    it('using path multijoueur/creer/classique to navigate to this page  should return false in the soloMode()', fakeAsync(() => {
        router.navigateByUrl(CREATE_MULTIPLAYER_GAME);
        component.isSoloMode();
        tick();
        fixture.detectChanges();
        expect(component.isSoloMode()).toEqual(false);
    }));

    it('should have a form with the solo Mode difficulty when we create a solo game', fakeAsync(() => {
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        const form = fixture.debugElement.nativeElement.querySelector('.soloMode');
        expect(form).toBeTruthy();
    }));

    it('should not have a form with the solo Mode difficulty when we create a multiplayer game', fakeAsync(() => {
        router.navigateByUrl(CREATE_MULTIPLAYER_GAME);
        tick();
        fixture.detectChanges();
        const form = fixture.debugElement.nativeElement.querySelector('.soloMode');
        expect(form).toBeFalsy();
    }));

    it('returnButton should redirect to home', fakeAsync(() => {
        const button = fixture.debugElement.nativeElement.querySelector('.return-button');
        button.click();
        tick();
        fixture.detectChanges();
        const expectedURL = '/' + RETURN_ROUTE;
        expect(location.path()).toEqual(expectedURL);
    }));

    it('should call createGame() when the start-button is pressed', fakeAsync(() => {
        component.playerName = 'Vincent';
        fixture.detectChanges();
        const spy = spyOn(component, 'createGame');
        const button = fixture.debugElement.nativeElement.querySelector('.start-button');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('createBotName should assign a name to the Expert opponent', fakeAsync(() => {
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        const difficultySelect = fixture.debugElement.nativeElement.querySelector('#difficulty-select');
        difficultySelect.click();
        tick();
        fixture.detectChanges();
        const difficultyOption = fixture.debugElement.queryAll(By.css('#difficulty-options'));
        difficultyOption[1].nativeElement.click();
        tick();
        fixture.detectChanges();
        flush();
        // eslint-disable-next-line dot-notation
        component['createBotName']();
        expect(component.botName).not.toEqual('');
    }));

    it('createBotName should assign a name to the Beginner opponent', () => {
        // eslint-disable-next-line dot-notation
        component['createBotName']();
        expect(component.botName).not.toEqual('');
    });

    it('should  not call createGame() if the player did not enter his name before trying to click the button', fakeAsync(() => {
        fixture.detectChanges();
        const spy = spyOn(component, 'createGame');
        const button = fixture.debugElement.nativeElement.querySelector('.start-button');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('giveNameToBot should call createBotName if  we use the path solo/classique to navigate to this page', fakeAsync(() => {
        const spy = spyOn(component, 'createBotName');
        router.navigateByUrl(SOLO_MODE);
        tick();
        component.giveNameToBot();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('giveNameToBot should not call createBotName if  we use the path multijoueur/creer/classique to navigate to this page', fakeAsync(() => {
        const spy = spyOn(component, 'createBotName');
        router.navigateByUrl(CREATE_MULTIPLAYER_GAME);
        tick();
        component.giveNameToBot();
        fixture.detectChanges();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should display 10 timer options when selecting timer', fakeAsync(() => {
        const timerSelect = fixture.debugElement.nativeElement.querySelector('#timer-select');
        timerSelect.click();
        tick();
        fixture.detectChanges();
        const timerOptions = fixture.debugElement.queryAll(By.css('#timer-options'));
        flush();
        expect(timerOptions.length).toEqual(component.timerList.length);
    }));
    it('should set timer to timer option when one is select', fakeAsync(() => {
        const timerSelect = fixture.debugElement.nativeElement.querySelector('#timer-select');
        timerSelect.click();
        tick();
        fixture.detectChanges();
        const timerOptions = fixture.debugElement.queryAll(By.css('#timer-options'));
        timerOptions[3].nativeElement.click();
        tick();
        fixture.detectChanges();
        flush();
        expect(component.form.get('timer')?.value).toEqual(component.timerList[3]);
    }));

    it('should display the timer option selected', fakeAsync(() => {
        const expectedValue = '2:00 minutes';
        const timerSelect = fixture.debugElement.nativeElement.querySelector('#timer-select');
        timerSelect.click();
        tick();
        fixture.detectChanges();
        const timerOptions = fixture.debugElement.queryAll(By.css('#timer-options'));
        timerOptions[3].nativeElement.click();
        tick();
        fixture.detectChanges();
        flush();
        expect(timerSelect.textContent).toEqual(expectedValue);
    }));

    it('createGame should call gameConfiguration.gameInitialization', fakeAsync(() => {
        component.playerName = 'Vincent';
        component.createGame();
        tick();
        flush();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalled();
    }));

    it('createGame should call gameConfiguration.gameInitialization with the good Value', fakeAsync(() => {
        component.playerName = 'Vincent';
        const TEST_PLAYER = {
            username: component.playerName,
            timer: 60,
            dictionary: 'Mon dictionnaire',
            mode: 'classique',
            isMultiplayer: true,
            opponent: undefined,
            botDifficulty: undefined,
        };
        component.selectedFile = { title: 'Mon dictionnaire', words: ['francais'] } as Dictionary;
        component.createGame();
        tick();
        flush();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalled();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalledWith(TEST_PLAYER);
    }));

    it('createGame should call gameConfiguration.gameInitialization with the good Value when we create a solo game', fakeAsync(() => {
        component.playerName = 'Vincent';
        component.botName = 'robert';
        const TEST_PLAYER = {
            username: component.playerName,
            timer: 60,
            dictionary: 'Mon dictionnaire',
            mode: 'classique',
            isMultiplayer: false,
            opponent: 'robert',
            botDifficulty: 'Débutant',
        };
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        component.selectedFile = { title: 'Mon dictionnaire', words: ['francais'] } as Dictionary;
        component.createGame();
        tick();
        flush();

        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalled();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalledWith(TEST_PLAYER);
    }));

    it('createGame should call navigatePage', fakeAsync(() => {
        const spy = spyOn(component, 'navigatePage');
        component.createGame();
        tick();
        flush();

        expect(spy).toHaveBeenCalled();
    }));

    it('createGame should call resetInput', fakeAsync(() => {
        // Testing private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'resetInput');

        component.createGame();
        tick();
        flush();

        expect(spy).toHaveBeenCalled();
    }));

    it('should call giveNameToBot() when the difficulty of the bot change', fakeAsync(() => {
        const spy = spyOn(component, 'giveNameToBot');
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        const difficultySelect = fixture.debugElement.nativeElement.querySelector('#difficulty-select');
        difficultySelect.click();
        tick();
        fixture.detectChanges();
        const difficultyOption = fixture.debugElement.queryAll(By.css('#difficulty-options'));
        difficultyOption[1].nativeElement.click();
        tick();
        fixture.detectChanges();
        flush();
        component.createGame();
        tick();
        flush();

        expect(component.form.get('difficultyBot')?.value).toEqual(component.difficultyList[1]);
        expect(spy).toHaveBeenCalled();
    }));

    it('should call giveNameToBot() two times when the difficulty of the bot change to Expert', fakeAsync(() => {
        const spy = spyOn(component, 'giveNameToBot');
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        const difficultySelect = fixture.debugElement.nativeElement.querySelector('#difficulty-select');
        difficultySelect.click();
        tick();
        fixture.detectChanges();
        const difficultyOption = fixture.debugElement.queryAll(By.css('#difficulty-options'));
        difficultyOption[1].nativeElement.click();
        tick();
        fixture.detectChanges();
        difficultyOption[0].nativeElement.click();
        tick();
        fixture.detectChanges();
        flush();
        expect(spy).toHaveBeenCalledTimes(2);
    }));

    it('validateName should change the name of the bot if he has the same name as the player', () => {
        const name = 'robert';
        component.playerName = name;
        component.botName = name;
        // eslint-disable-next-line dot-notation
        component['validateName']();
        expect(component.botName).not.toEqual(name);
    });

    it('validateName should not change the name of the bot if he has not the same name as the player', () => {
        const name = 'robert';
        component.playerName = 'Vincent';
        component.botName = name;
        // eslint-disable-next-line dot-notation
        component['validateName']();
        expect(component.botName).toEqual(name);
    });

    it('createGame should not call gameConfiguration.beginScrabbleGame when we create a multiplayer game', fakeAsync(() => {
        component.playerName = 'Vincent';
        router.navigateByUrl(CREATE_MULTIPLAYER_GAME);
        tick();
        fixture.detectChanges();
        component.createGame();
        tick();
        flush();

        setTimeout(() => {
            expect(gameConfigurationServiceSpy.beginScrabbleGame).not.toHaveBeenCalled();
        }, 150);
        flush();
    }));

    it('createGame should do nothing if selected dictionary is no longer in the database', fakeAsync(() => {
        const navigatePageSpy = spyOn(component, 'navigatePage');
        const validateNameSpy = spyOn(component, 'validateName' as never);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resetInputSpy = spyOn<any>(component, 'resetInput');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dictionaryIsInDBStub = spyOn<any>(component, 'dictionaryIsInDB');
        dictionaryIsInDBStub.and.resolveTo(false);
        component.createGame();
        tick();
        flush();
        expect(navigatePageSpy).not.toHaveBeenCalled();
        expect(validateNameSpy).not.toHaveBeenCalled();
        expect(resetInputSpy).not.toHaveBeenCalled();
        expect(gameConfigurationServiceSpy.gameInitialization).not.toHaveBeenCalled();
    }));

    it('resetInput() should clear the playerName', () => {
        const VALID_NAME = 'Serge';
        component.playerName = VALID_NAME;
        // Testing private method
        // eslint-disable-next-line dot-notation
        component['resetInput']();
        expect(component.playerName).toEqual('');
    });

    it('getDictionary() should return selectedFile if a file has been imported', () => {
        const expectedDictionary = {} as Dictionary;
        component.selectedFile = expectedDictionary;
        // eslint-disable-next-line dot-notation
        expect(component['getDictionary']('title')).toEqual(expectedDictionary);
    });

    it('getDictionary() should return the dictionary matching param title if there is no import file', () => {
        // eslint-disable-next-line dot-notation
        expect(component['getDictionary'](DB_DICTIONARY.title)).toEqual(DB_DICTIONARY);
    });

    it('readFile() should return the content of the file', async () => {
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // eslint-disable-next-line dot-notation
        const res = await component['readFile'](new File([blob], 'test.json'), new FileReader());
        expect(res).toEqual(DB_DICTIONARY);
    });

    it('readFile() should return error message if file cannot be opened ', () => {
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const fileReader = new FileReader();
        // eslint-disable-next-line dot-notation
        const res = component['readFile'](new File([blob], 'test.json'), fileReader).then(() => {
            fileReader.dispatchEvent(new ErrorEvent('error'));
        });
        expect(res).not.toEqual(DB_DICTIONARY as unknown as Promise<Record<string, unknown>>);
    });

    it('dictionaryIsInDB() should return error message if file is not in database ', fakeAsync(() => {
        const title = 'test';
        const updateDictionaryMessageSpy = spyOn(component, 'updateDictionaryMessage');
        // Testing private method
        // eslint-disable-next-line dot-notation
        component['dictionaryIsInDB'](title);
        tick();
        flush();
        expect(updateDictionaryMessageSpy).toHaveBeenCalledWith("Ce dictionnaire n'est plus disponible, veuillez choisir un autre", 'red');
    }));
});
