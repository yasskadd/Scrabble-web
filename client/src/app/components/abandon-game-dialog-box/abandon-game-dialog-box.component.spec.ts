import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameClientService } from '@app/services/game-client.service';
import { AbandonGameDialogBoxComponent } from './abandon-game-dialog-box.component';
const MULTIPLAYER_HOME_PAGE = 'home';

@Component({
    template: '',
})
export class StubComponent {}
describe('AbandonGameDialogBoxComponent', () => {
    let router: Router;
    let component: AbandonGameDialogBoxComponent;
    let fixture: ComponentFixture<AbandonGameDialogBoxComponent>;
    let matSnackBar: MatSnackBar;
    let gameClientServiceSpy: jasmine.SpyObj<GameClientService>;

    beforeEach(async () => {
        gameClientServiceSpy = jasmine.createSpyObj('GameClientService', ['abandonGame']);
        await TestBed.configureTestingModule({
            declarations: [AbandonGameDialogBoxComponent],
            imports: [
                MatSnackBarModule,
                MatIconModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: MULTIPLAYER_HOME_PAGE, component: StubComponent }]),
            ],
            providers: [{ provide: GameClientService, useValue: gameClientServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AbandonGameDialogBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        matSnackBar = TestBed.inject(MatSnackBar);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openSnackBar should call the MatSnackBar open method', () => {
        const message = 'Vous avez abandonné la partie';
        const matSnackBarSpy = spyOn(matSnackBar, 'open').and.stub();
        component.openSnackBar();
        expect(matSnackBarSpy.calls.count()).toBe(1);
        const args = matSnackBarSpy.calls.argsFor(0);
        expect(args[0]).toBe(message);
        expect(args[1]).toBe('fermer');
        expect(args[2]).toEqual({
            verticalPosition: 'top',
        });
    });

    it('abandonGame should call gameClient.abandonGame', () => {
        component.abandonGame();
        fixture.detectChanges();
        expect(gameClientServiceSpy.abandonGame).toHaveBeenCalled();
    });

    it('navigatePage should navigate to /classique/multijoueur/salleAttente', () => {
        const spyRouter = spyOn(router, 'navigate');
        const expectedURL = '/' + MULTIPLAYER_HOME_PAGE;
        component.abandonGame();
        expect(spyRouter).toHaveBeenCalledWith([expectedURL]);
    });
});
