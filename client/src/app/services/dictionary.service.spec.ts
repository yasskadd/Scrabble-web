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
            'resetDictionaries',
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
        httpHandlerSpy.resetDictionaries.and.returnValue(
            of([
                {
                    title: 'Default',
                    description: 'default dictionary',
                } as Dictionary,
            ]),
        );

        TestBed.configureTestingModule({
            providers: [{ provide: HttpHandlerService, useValue: httpHandlerSpy }],
        });
        service = TestBed.inject(DictionaryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call httpHandler addDictionary() when calling dictionaryService addDictionary() is called', () => {
        service.addDictionary({ title: 'test dictionary', description: 'a test dictionary', words: ['Expert', 'yo', 'ma'] });
        expect(httpHandlerSpy.addDictionary).toHaveBeenCalled();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('should call httpHandler deleteDictionary() when calling dictionaryService deleteDictionary() is called', () => {
        service.deleteDictionary({ title: 'test dictionary', description: 'a test dictionary', words: ['Expert', 'yo', 'ma'] });
        expect(httpHandlerSpy.deleteDictionary).toHaveBeenCalled();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('should call httpHandler modifyDictionary() when calling dictionaryService modifyDictionary() is called', () => {
        service.modifyDictionary({ oldTitle: 'test dictionary', newTitle: 'test test', newDescription: 'a test dictionary' });
        expect(httpHandlerSpy.modifyDictionary).toHaveBeenCalled();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('should call httpHandler resetDictionaries() when calling dictionaryService resetDictionaries() is called', () => {
        service.resetDictionaries();
        expect(httpHandlerSpy.resetDictionaries).toHaveBeenCalled();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('should call httpHandler getDictionaries() when calling dictionaryService getDictionaries() is called', () => {
        service.getDictionaries();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });
});
