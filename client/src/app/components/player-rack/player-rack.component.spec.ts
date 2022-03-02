import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as constants from '@app/constants';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { GameClientService } from '@app/services/game-client.service';
import { GridService } from '@app/services/grid.service';
import { Letter } from '@common/letter';
import { PlayerRackComponent } from './player-rack.component';

const LETTER_SIZE = 5;

describe('PlayerRackComponent', () => {
    let component: PlayerRackComponent;
    let fixture: ComponentFixture<PlayerRackComponent>;
    let chatBoxHandlerSpy: jasmine.SpyObj<ChatboxHandlerService>;
    let gameClientServiceSpy: jasmine.SpyObj<GameClientService>;
    let gridServiceServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async () => {
        chatBoxHandlerSpy = jasmine.createSpyObj('ChatboxHandlerService', ['submitMessage']);
        gameClientServiceSpy = jasmine.createSpyObj('GameClientService', ['updateGameboard'], {
            playerOneTurn: true,
            playerOne: { rack: [{ value: 'a' } as Letter] },
        });
        gridServiceServiceSpy = jasmine.createSpyObj('GridService', [], { letterSize: LETTER_SIZE });
        await TestBed.configureTestingModule({
            declarations: [PlayerRackComponent],
            providers: [
                { provide: ChatboxHandlerService, useValue: chatBoxHandlerSpy },
                { provide: GameClientService, useValue: gameClientServiceSpy },
                { provide: GridService, useValue: gridServiceServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the method gameClientService.quitGame if leaveGame is called', () => {
        component.skipTurn();
        expect(chatBoxHandlerSpy.submitMessage).toHaveBeenCalled();
    });

    it('should call skipTurn when the button to skip is pressed and it is your turn to play', fakeAsync(() => {
        const spy = spyOn(component, 'skipTurn');
        const button = fixture.debugElement.nativeElement.querySelector('#skipTurn');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('OnRightClick should select a letter and insert it into the lettersToExchange on right click', fakeAsync(() => {
        const indexLetter = 0;
        const mockClick = new MouseEvent('oncontextmenu');
        component.onRightClick(mockClick, indexLetter);
        fixture.detectChanges();
        const lettersDiv = fixture.debugElement.nativeElement.querySelector('#player-letters').children;
        expect(component.lettersToExchange.length).toEqual(1);
        expect(lettersDiv[indexLetter].className).toEqual('rack-Letter-selected');
    }));

    it('OnRightClick should deselect a letter already selected on right click ', fakeAsync(() => {
        const indexLetter = 0;
        const mockClick = new MouseEvent('oncontextmenu');
        component.onRightClick(mockClick, indexLetter);
        component.onRightClick(mockClick, indexLetter);
        fixture.detectChanges();
        const lettersDiv = fixture.debugElement.nativeElement.querySelector('#player-letters').children;
        expect(component.lettersToExchange.length).toEqual(0);
        expect(lettersDiv[indexLetter].className).toEqual('rack-Letter');
    }));

    it('should call exchange when the button to exchange is pressed and it is your turn to play', fakeAsync(() => {
        const spy = spyOn(component, 'exchange');
        component.lettersToExchange = [0];
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#exchange');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('exchange should call submitMessage of chatBoxHandler with the letters to exchange as argument', () => {
        component.lettersToExchange = [0];
        component.exchange();
        expect(chatBoxHandlerSpy.submitMessage).toHaveBeenCalledWith('!échanger a');
    });

    it('exchange should call cancel', () => {
        const spy = spyOn(component, 'cancel');
        component.cancel();
        expect(spy).toHaveBeenCalled();
    });

    it("letterSize should return a letter's size", () => {
        expect(component.letterSize).toEqual(LETTER_SIZE);
    });
    it("pointsSize should return a letter's size", () => {
        expect(component.pointsSize).toEqual(LETTER_SIZE * constants.LETTER_WEIGHT_RATIO);
    });

    it('should call cancel when the button to cancel selection is pressed', fakeAsync(() => {
        const spy = spyOn(component, 'cancel');
        component.lettersToExchange = [0];
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('#cancel');
        button.click();
        tick();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('cancel should return set lettersToExchange to an empty array', () => {
        component.lettersToExchange = [0];
        component.cancel();
        expect(component.lettersToExchange.length).toEqual(0);
    });
});
