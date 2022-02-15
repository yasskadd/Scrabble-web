// eslint-disable-next-line max-classes-per-file
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
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
const PLAYER_ONE: Player = {
    name: '667',
    score: 23,
    rack: [{ value: 'b', quantity: 2, points: 1 }],
    room: '1',
};

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
@Component({
    template: '',
})
export class StubComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}
describe('InformationPanelComponent', () => {
    let router: Router;
    let component: InformationPanelComponent;
    let fixture: ComponentFixture<InformationPanelComponent>;
    let gameClientSpy: jasmine.SpyObj<GameClientService>;

    beforeEach(async () => {
        gameClientSpy = jasmine.createSpyObj('GameClientService', ['startTimer', 'quitGame'], {
            playerOne: PLAYER_ONE,
            secondPlayer: PLAYER_TWO,
            gameTimer: TIMER,
        });
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: MULTIPLAYER_HOME_PAGE, component: StubComponent }])],
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

    // ???? not sure why this is not working
    it('should call the method gameClientService.updateGameboard if updateFontSize is called', () => {
        const drawWeightSpy = spyOn(gameClientSpy, 'updateGameboard' as never).and.callThrough();
        component.updateFontSize();
        expect(drawWeightSpy).toHaveBeenCalled();
    });
});
