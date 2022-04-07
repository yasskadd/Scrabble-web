import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { of } from 'rxjs';
import { GamesHistoryComponent } from './games-history.component';

const DUMMY_GAME_INFO = {
    firstPlayerName: 'Vincent',
    secondPlayerName: 'Maidenless',
    mode: 'classique',
    firstPlayerScore: 20,
    secondPlayerScore: 0,
    abandoned: true,
    beginningTime: new Date(),
    endTime: new Date(),
    duration: 'Too big',
};

describe('GamesHistoryComponent', () => {
    let component: GamesHistoryComponent;
    let fixture: ComponentFixture<GamesHistoryComponent>;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;

    beforeEach(async () => {
        httpHandlerSpy = jasmine.createSpyObj('HttpHandlerService', ['getHistory', 'deleteHistory']);
        httpHandlerSpy.getHistory.and.returnValue(of([DUMMY_GAME_INFO]));
        httpHandlerSpy.deleteHistory.and.returnValue(of());
        await TestBed.configureTestingModule({
            imports: [MatIconModule, MatExpansionModule, MatCardModule, BrowserAnimationsModule],
            declarations: [GamesHistoryComponent],
            providers: [{ provide: HttpHandlerService, useValue: httpHandlerSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamesHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getHistory when calling updateHistory', () => {
        component.updateHistory();
        expect(httpHandlerSpy.getHistory).toHaveBeenCalled();
    });

    it('should call deleteHistory and getHistory when calling deleteHistory', () => {
        component.deleteHistory();
        expect(httpHandlerSpy.deleteHistory).toHaveBeenCalled();
        expect(httpHandlerSpy.getHistory).toHaveBeenCalled();
    });
});
