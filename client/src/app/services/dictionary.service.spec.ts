import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { of } from 'rxjs';
import { DictionaryService } from './dictionary.service';

describe('VirtualPlayersService', () => {
    let service: DictionaryService;
    let httpHandlerSpy: jasmine.SpyObj<HttpHandlerService>;

    beforeEach(() => {
        httpHandlerSpy = jasmine.createSpyObj('HttpHandlerService', [
            'addDictionary',
            'deleteDictionary',
            'resetDictionary',
            'modifyDictionary',
            'getDictionaries',
        ]);
        httpHandlerSpy.addDictionary.and.returnValue(of());
        httpHandlerSpy.deleteDictionary.and.returnValue(of());
        httpHandlerSpy.modifyDictionary.and.returnValue(of());
        httpHandlerSpy.getDictionaries.and.returnValue(
            of([
                {
                    title: 'Français',
                    description: 'XXX',
                } as Dictionary,
            ]),
        );
        TestBed.configureTestingModule({
            providers: [{ provide: HttpHandlerService, useValue: httpHandlerSpy }],
        });
        service = TestBed.inject(VirtualPlayersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call getDictionarieswhen calling getDictionaryTitle', () => {
        service.getDictionaryNames();
        expect(httpHandlerSpy.getBeginnerBots).toHaveBeenCalled();
        expect(httpHandlerSpy.getExpertBots).toHaveBeenCalled();
    });

    it('should call replaceBot when calling replaceBotName', () => {
        service.replaceBotName({ currentName: 'Vincent', newName: 'Laure', difficulty: 'Expert' });
        expect(httpHandlerSpy.replaceBot).toHaveBeenCalled();
    });

    it('should call resetBot when calling resetBotNames', () => {
        service.resetBotNames();
        expect(httpHandlerSpy.resetBot).toHaveBeenCalled();
    });

    it('should call deleteBot when calling deleteBotName', () => {
        service.deleteBotName('vincent', 'debutant');
        expect(httpHandlerSpy.deleteBot).toHaveBeenCalled();
    });

    it('should call addBot when calling addBotName', () => {
        service.addBotName('vincent', VirtualPlayer.Beginner);
        expect(httpHandlerSpy.addBot).toHaveBeenCalled();
        service.addBotName('vincent', VirtualPlayer.Expert);
        expect(httpHandlerSpy.addBot).toHaveBeenCalled();
    });
});
