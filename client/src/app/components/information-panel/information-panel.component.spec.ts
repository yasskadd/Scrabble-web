// eslint-disable-next-line max-classes-per-file
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameClientService } from '@app/services/game-client.service';
import { Letter } from '@common/letter';
import { of } from 'rxjs';
import { InformationPanelComponent } from './information-panel.component';

const MULTIPLAYER_HOME_PAGE = 'home';
type Timer = { minutes: number; seconds: number };
type Player = { name: string; score: number; rack?: Letter[]; room: string };

const TIMER: Timer = { minutes: 1, seconds: 20 };

const PLAYER_TWO: Player = {
    name: 'QLF',
    score: 327,
    rack: [
        { value: 'c', quantity: 2, points: 1 },
        { value: 'r', quantity: 2, points: 1 },
        { value: 'p', quantity: 2, points: 1 },
    ],
    room: '3',
};
const PLAYER_ONE: Player = {
    name: '667',
    score: 23,
    rack: [
        { value: 'a', quantity: 2, points: 1 },
        { value: 'b', quantity: 2, points: 1 },
    ],
    room: '1',
};
@Component({
    template: '',
})
export class StubComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({ action: true }),
        };
    }
}

describe('InformationPanelComponent', () => {
    let router: Router;
    let component: InformationPanelComponent;
    let fixture: ComponentFixture<InformationPanelComponent>;
    let gameClientSpy: jasmine.SpyObj<GameClientService>;
    beforeEach(async () => {
        gameClientSpy = jasmine.createSpyObj('GameClientService', ['startTimer', 'quitGame', 'updateGameboard'], {
            playerOne: PLAYER_ONE,
            secondPlayer: PLAYER_TWO,
            gameTimer: TIMER,
        });
        await TestBed.configureTestingModule({
            imports: [
                MatSliderModule,
                FormsModule,
                BrowserModule,
                RouterTestingModule.withRoutes([{ path: MULTIPLAYER_HOME_PAGE, component: StubComponent }]),
            ],
            declarations: [InformationPanelComponent],
            providers: [
                { provide: GameClientService, useValue: gameClientSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog box if the abandonGame method is called', () => {
        const dialogSpy = spyOn(component.dialog, 'open');
        component.abandonGame();
        expect(dialogSpy).toHaveBeenCalled();
    });
    it('should navigate to the home page if the leaveGame method is called', () => {
        const spyRouter = spyOn(router, 'navigate');
        const expectedURL = '/' + MULTIPLAYER_HOME_PAGE;
        component.leaveGame();
        expect(spyRouter).toHaveBeenCalledWith([expectedURL]);
    });

    it('should call the method gameClientService.quitGame if leaveGame is called', () => {
        component.leaveGame();
        expect(gameClientSpy.quitGame).toHaveBeenCalled();
    });

    it('formatLabel should ', () => {
        const valueToFormat = 4;
        const expectedValue = '4px';
        const testedValue = component.formatLabel(valueToFormat);
        expect(testedValue).toEqual(expectedValue);
    });

    it('should call the method gameClientService.updateGameboard if updateFontSize is called', () => {
        // const newSize = 28;
        // const spy = spyOn(component, 'updateFontSize');
        // // expect(gameClientSpy.updateGameboard).toHaveBeenCalled();
        // expect(spy).toHaveBeenCalled();
    });

    it('should have a div with the timer when it is your turn to play', () => {
        gameClientSpy.playerOneTurn = true;
        fixture.detectChanges();
        const divTimer = fixture.debugElement.nativeElement.querySelector('#playerOneTimer');
        expect(divTimer).toBeTruthy();
    });

    it('should not have a div with the timer when it is not your turn to play', () => {
        gameClientSpy.playerOneTurn = false;
        fixture.detectChanges();
        const divTimer = fixture.debugElement.nativeElement.querySelector('#playerOneTimer');
        expect(divTimer).not.toBeTruthy();
    });

    it('should have a div with the timer when it is your opponent turn to play', () => {
        gameClientSpy.playerOneTurn = false;
        fixture.detectChanges();
        const divTimer = fixture.debugElement.nativeElement.querySelector('#playerTwoTimer');
        expect(divTimer).toBeTruthy();
    });

    it('should not have a div with the timer when it is not your opponent turn to play', () => {
        gameClientSpy.playerOneTurn = true;
        fixture.detectChanges();
        const divTimer = fixture.debugElement.nativeElement.querySelector('#playerTwoTimer');
        expect(divTimer).not.toBeTruthy();
    });

    it('should have a button to abandonGame when the game is not finish and you want to leave', () => {
        gameClientSpy.isGameFinish = false;
        fixture.detectChanges();
        const buttonAbandon = fixture.debugElement.nativeElement.querySelector('#abandonButton');
        expect(buttonAbandon).toBeTruthy();
    });

    it('should not have a button to abandonGame when the game is finish and you want to leave', () => {
        gameClientSpy.isGameFinish = true;
        fixture.detectChanges();
        const buttonAbandon = fixture.debugElement.nativeElement.querySelector('#abandonButton');
        expect(buttonAbandon).not.toBeTruthy();
    });

    it('should have a button to quitGame when the game is finish and you want to leave', () => {
        gameClientSpy.isGameFinish = true;
        fixture.detectChanges();
        const leaveButton = fixture.debugElement.nativeElement.querySelector('#quitGame');
        expect(leaveButton).toBeTruthy();
    });

    it('should not have a button to quitGame when the game is not finish', () => {
        gameClientSpy.isGameFinish = false;
        fixture.detectChanges();
        const leaveButton = fixture.debugElement.nativeElement.querySelector('#quitGame');
        expect(leaveButton).not.toBeTruthy();
    });

    it('should call abandonGame when the abandonButton button is pressed', fakeAsync(() => {
        const spy = spyOn(component, 'abandonGame');
        gameClientSpy.isGameFinish = false;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#abandonButton');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toBeTruthy();
    }));

    it('should call leaveGame when the quitGame button is pressed', fakeAsync(() => {
        const spy = spyOn(component, 'leaveGame');
        gameClientSpy.isGameFinish = true;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#quitGame');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toBeTruthy();
    }));

    it('should have a winning message when the game is finish', () => {
        gameClientSpy.isGameFinish = true;
        fixture.detectChanges();
        const message = fixture.debugElement.nativeElement.querySelector('#winningMessage');
        expect(message).toBeTruthy();
    });

    it('should not have a winning message when the game is not finish', () => {
        gameClientSpy.isGameFinish = false;
        fixture.detectChanges();
        const message = fixture.debugElement.nativeElement.querySelector('#winningMessage');
        expect(message).not.toBeTruthy();
    });

    it('should call updateGameboard() when the mat-slider is triggered', () => {
        const mockSlider = new MatSliderChange();
        component.updateFontSize(mockSlider);
        fixture.detectChanges();
        expect(gameClientSpy.updateGameboard).toHaveBeenCalled();
    });

    it('timerToMinute() should return number of minute in the timer', () => {
        const twoMinute = 120;
        const expectedValue = 2;
        expect(component.timerToMinute(twoMinute)).toEqual(expectedValue);
    });

    it('timerToSecond() should return number of second in the timer', () => {
        const fiftyNineSecond = 179;
        const expectedValue = 59;
        expect(component.timerToSecond(fiftyNineSecond)).toEqual(expectedValue);
    });
});
