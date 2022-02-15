import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { PlayerRackComponent } from './player-rack.component';

describe('PlayerRackComponent', () => {
    let component: PlayerRackComponent;
    let fixture: ComponentFixture<PlayerRackComponent>;
    let chatBoxHandlerSpy: jasmine.SpyObj<ChatboxHandlerService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerRackComponent],
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
});
