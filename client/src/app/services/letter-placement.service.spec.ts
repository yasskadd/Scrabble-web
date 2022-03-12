import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';
import { LetterPlacementService } from './letter-placement.service';

fdescribe('LetterPlacementService', () => {
    let service: LetterPlacementService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let chatboxServiceSpy: jasmine.SpyObj<ChatboxHandlerService>;
    let gameClientServiceSpy: jasmine.SpyObj<GameClientService>;
    // let updatedGameSubscribableStub: Observable;

    beforeEach(() => {
        // updatedGameSubscribableStub = of({});
        gridServiceSpy = jasmine.createSpyObj('GridService', ['drawUnfinalizedLetter', 'getPosition', 'drawArrow', 'drawGrid']);
        chatboxServiceSpy = jasmine.createSpyObj('ChatboxHandlerService', ['submitMessage']);
        gameClientServiceSpy = jasmine.createSpyObj('GameClientService', [''], {
            gameboardUpdated: of({}),
            playerOne: { rack: [] },
            playerOneTurn: false,
            gameboard: [],
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: GridService, useValue: gridServiceSpy },
                { provide: ChatboxHandlerService, useValue: chatboxServiceSpy },
                { provide: GameClientService, useValue: gameClientServiceSpy },
            ],
        });
        service = TestBed.inject(LetterPlacementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
