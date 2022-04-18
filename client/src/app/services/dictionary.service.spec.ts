import { fakeAsync, TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from '@app/services/communication/http-handler.service';
import { of } from 'rxjs';
import { DictionaryService } from './dictionary.service';

const DB_DICTIONARY = { _id: '932487fds', title: 'Mon dictionnaire', description: 'Un dictionnaire' };

describe('DictionaryService', () => {
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
        service.deleteDictionary({ title: 'test dictionary', description: 'a test dictionary' });
        expect(httpHandlerSpy.deleteDictionary).toHaveBeenCalled();
        expect(httpHandlerSpy.getDictionaries).toHaveBeenCalled();
    });

    it('should call httpHandler modifyDictionary() when calling dictionaryService modifyDictionary() is called', () => {
        service.modifyDictionary({ title: 'test dictionary', newTitle: 'test test', newDescription: 'a test dictionary' });
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

    // TODO : ces tests se trouvaient dans le multiplayer create page avant, mais les fonctions on été move dans le dictionary service
    fit('uploadDictionary() should call fileOnLoad() if there is a selected file to upload', async () => {
        const messageSpy = spyOn(service, 'fileOnLoad');
        const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        const dT = new DataTransfer();
        dT.items.add(new File([blob], 'test.json'));
        service.file.nativeElement.files = dT.files;
        service.uploadDictionary().globalVerification.and.callFake(() => 'Did not passed');
        await service.uploadDictionary();
        expect(messageSpy).toHaveBeenCalled();
    });

    it('fileOnLoad() should call addDictionary of HttpHandlerService if file selected passed globalVerification of DictionaryVerificationService', fakeAsync(() => {
        // const messageSpy = spyOn(component, 'updateDictionaryMessage');
        // const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // const dT = new DataTransfer();
        // dT.items.add(new File([blob], 'test.json'));
        // component.file.nativeElement.files = dT.files;
        // dictionaryVerificationSpy.globalVerification.and.callFake(() => 'Passed');
        // component.fileOnLoad({});
        // tick(5000);
        // expect(messageSpy).toHaveBeenCalledWith('Ajout avec succès du nouveau dictionnaire', 'black');
        // expect(httpHandlerSpy.addDictionary).toHaveBeenCalled();
    }));

    it('fileOnLoad() should call importDictionary of GameConfigurationService if file selected passed globalVerification of DictionaryVerificationService', fakeAsync(() => {
        // const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // const dT = new DataTransfer();
        // dT.items.add(new File([blob], 'test.json'));
        // component.file.nativeElement.files = dT.files;
        // dictionaryVerificationSpy.globalVerification.and.callFake(() => 'Passed');
        // component.fileOnLoad({});
        // tick(5000);
        // expect(gameConfigurationServiceSpy.importDictionary).toHaveBeenCalled();
    }));

    // eslint-disable-next-line max-len
    it('fileOnLoad() should call updateImportMessage with error message if file selected did not pass globalVerification of DictionaryVerificationService', fakeAsync(() => {
        // const messageSpy = spyOn(component, 'updateDictionaryMessage');
        // const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // const dT = new DataTransfer();
        // dT.items.add(new File([blob], 'test.json'));
        // component.file.nativeElement.files = dT.files;
        // dictionaryVerificationSpy.globalVerification.and.callFake(() => 'Did not passed');
        // component.fileOnLoad({});
        // tick(5000);
        // expect(messageSpy).toHaveBeenCalledWith('Did not passed', 'red');
    }));

    it('readFile() should return the content of the file', async () => {
        // const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // // eslint-disable-next-line dot-notation
        // const res = await component['readFile'](new File([blob], 'test.json'), new FileReader());
        // expect(res).toEqual(DB_DICTIONARY);
    });

    it('readFile() should return error message if file cannot be opened ', () => {
        // const blob = new Blob([JSON.stringify(DB_DICTIONARY)], { type: 'application/json' });
        // const fileReader = new FileReader();
        // eslint-disable-next-line dot-notation
        // const res = component['readFile'](new File([blob], 'test.json'), fileReader).then(() => {
        //     fileReader.dispatchEvent(new ErrorEvent('error'));
        // });
        // expect(res).not.toEqual(DB_DICTIONARY as unknown as Promise<Record<string, unknown>>);
    });
});
