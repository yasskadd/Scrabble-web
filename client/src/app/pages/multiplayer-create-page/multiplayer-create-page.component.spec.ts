// eslint-disable-next-line max-classes-per-file
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameConfigurationService } from '@app/services/game-configuration.service';
import { MultiplayerCreatePageComponent } from './multiplayer-create-page.component';
@Component({
    template: '',
})
export class StubComponent {}

const MULTIPLAYER_WAITING_ROOM_ROUTE = 'multijoueur/salleAttente/classique';
const RETURN_ROUTE = 'home';
describe('MultiplayerCreatePageComponent', () => {
    let component: MultiplayerCreatePageComponent;
    let fixture: ComponentFixture<MultiplayerCreatePageComponent>;
    let location: Location;
    let gameConfigurationServiceSpy: jasmine.SpyObj<GameConfigurationService>;
    beforeEach(async () => {
        gameConfigurationServiceSpy = jasmine.createSpyObj('GameConfigurationService', ['gameInitialization', 'resetRoomInformation']);
        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                MatInputModule,
                MatFormFieldModule,
                MatSelectModule,
                MatOptionModule,
                MatIconModule,
                MatCardModule,
                RouterTestingModule.withRoutes([
                    { path: MULTIPLAYER_WAITING_ROOM_ROUTE, component: StubComponent },
                    { path: RETURN_ROUTE, component: StubComponent },
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiplayerCreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        location = TestBed.inject(Location);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('navigatePage should redirect to salleAttente', fakeAsync(() => {
        const expectedURL = '/' + MULTIPLAYER_WAITING_ROOM_ROUTE;
        component.navigatePage();
        tick();
        fixture.detectChanges();
        expect(location.path()).toEqual(expectedURL);
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
        flush();
        expect(component.timer.toString()).toEqual(component.timerList[3].toString());
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
        const TEST_PLAYER = { username: component.playerName, timer: component.timer, dictionary: 'francais', mode: 'classique' };
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

    it('secondToMinute() should convert second to minute display', () => {
        const TIMER1 = 180;
        const TIMER2 = 210;
        const expectedValue1 = '3:00 minutes';
        const expectedValue2 = '3:30 minutes';
        expect(component.secondToMinute(TIMER1)).toEqual(expectedValue1);
        expect(component.secondToMinute(TIMER2)).toEqual(expectedValue2);
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
