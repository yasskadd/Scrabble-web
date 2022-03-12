// eslint-disable-next-line max-classes-per-file
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { MultiplayerCreatePageComponent } from './multiplayer-create-page.component';
@Component({
    template: '',
})
export class StubComponent {}

const MULTIPLAYER_WAITING_ROOM_ROUTE = 'multijoueur/salleAttente/classique';
const SOLO_MODE = 'solo/classique';
const CREATE_MULTIPLAYER_GAME = 'multijoueur/creer/classique';
const RETURN_ROUTE = 'home';
const GAME_ROUTE = 'game';

describe('MultiplayerCreatePageComponent', () => {
    let component: MultiplayerCreatePageComponent;
    let fixture: ComponentFixture<MultiplayerCreatePageComponent>;
    let location: Location;
    let router: Router;
    let gameConfigurationServiceSpy: jasmine.SpyObj<GameConfigurationService>;
    beforeEach(async () => {
        gameConfigurationServiceSpy = jasmine.createSpyObj('GameConfigurationService', [
            'gameInitialization',
            'resetRoomInformation',
            'beginScrabbleGame',
        ]);
        await TestBed.configureTestingModule({
            imports: [
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(MultiplayerCreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        location = TestBed.inject(Location);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    it('using path solo/classique to navigate to this page return  should true in the soloMode()', fakeAsync(() => {
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

    it('Should have a form with the solo Mode difficulty when we create a solo game', fakeAsync(() => {
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        const form = fixture.debugElement.nativeElement.querySelector('.soloMode');
        expect(form).toBeTruthy();
    }));

    it('Should  not have a form with the solo Mode difficulty when we create a multiplayer game', fakeAsync(() => {
        router.navigateByUrl(CREATE_MULTIPLAYER_GAME);
        tick();
        fixture.detectChanges();
        const form = fixture.debugElement.nativeElement.querySelector('.soloMode');
        expect(form).toBeFalsy();
    }));

    it('returnButton should redirect to home', fakeAsync(() => {
        const button = fixture.debugElement.nativeElement.querySelector('.returnButton');
        button.click();
        tick();
        fixture.detectChanges();
        const expectedURL = '/' + RETURN_ROUTE;
        expect(location.path()).toEqual(expectedURL);
    }));
    it('should call createGame() when the startButton is pressed', fakeAsync(() => {
        component.playerName = 'Vincent';
        fixture.detectChanges();
        const spy = spyOn(component, 'createGame');
        const button = fixture.debugElement.nativeElement.querySelector('.startButton');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('should  not call createGame() if the player did not enter his name before trying to click the button', fakeAsync(() => {
        fixture.detectChanges();
        const spy = spyOn(component, 'createGame');
        const button = fixture.debugElement.nativeElement.querySelector('.startButton');
        button.click();
        tick();
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

    it('should set display the timer option selected', fakeAsync(() => {
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
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalled();
    }));

    it('createGame should call gameConfiguration.gameInitialization with the good Value', fakeAsync(() => {
        component.playerName = 'Vincent';
        const TEST_PLAYER = { username: component.playerName, timer: 60, dictionary: 'francais', mode: 'classique', isMultiplayer: true };
        component.createGame();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalled();
        expect(gameConfigurationServiceSpy.gameInitialization).toHaveBeenCalledWith(TEST_PLAYER);
    }));
    it('createGame should call navigatePage', fakeAsync(() => {
        const spy = spyOn(component, 'navigatePage');
        component.createGame();

        expect(spy).toHaveBeenCalled();
    }));
    it('createGame should call resetInput', fakeAsync(() => {
        // Testing private method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'resetInput');

        component.createGame();
        expect(spy).toHaveBeenCalled();
    }));

    it('createGame should call gameConfiguration.beginScrabbleGame with the name of the bot in SoloMode', fakeAsync(() => {
        component.playerName = 'Vincent';
        router.navigateByUrl(SOLO_MODE);
        tick();
        fixture.detectChanges();
        component.createGame();
        setTimeout(() => {
            expect(gameConfigurationServiceSpy.beginScrabbleGame).toHaveBeenCalled();
        }, 0);
        flush();
    }));

    it('secondToMinute() should convert second to minute display', () => {
        const TIMER1 = 180;
        const TIMER2 = 210;
        const expectedValue1 = '3:00 minutes';
        const expectedValue2 = '3:30 minutes';
        expect(component.secondToMinute(TIMER1)).toEqual(expectedValue1);
        expect(component.secondToMinute(TIMER2)).toEqual(expectedValue2);
    });

    it('createBotName() should return a name for the bot which is not the same as the player', () => {
        const VALID_NAME = 'jean';
        component.playerName = VALID_NAME;
        // Testing private method
        // eslint-disable-next-line dot-notation
        expect(component['createBotName']()).not.toEqual(VALID_NAME);
    });

    it('ResetInput() should clear the playerName', () => {
        const VALID_NAME = 'Serge';
        component.playerName = VALID_NAME;
        // Testing private method
        // eslint-disable-next-line dot-notation
        component['resetInput']();
        expect(component.playerName).toEqual('');
    });
});
