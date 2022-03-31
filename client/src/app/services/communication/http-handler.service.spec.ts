import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { HttpHandlerService } from './http-handler.service';

describe('HttpHandlerService', () => {
    let service: HttpHandlerService;
    let httpMock: HttpTestingController;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HttpHandlerService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected highScoreClassique list (HttpClient called once)', () => {
        const expectedMessage: HighScores[] = [{ _id: '245isfdhhsdf', username: 'Vincent', type: 'Classique', score: 20, position: '1' }];

        // check the content of the mocked call
        service.getClassicHighScore().subscribe((response: HighScores[]) => {
            expect(response).toEqual(expectedMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/highScore/classique`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should return expected highScoreLOG2990 list (HttpClient called once)', () => {
        const expectedMessage: HighScores[] = [{ _id: '245isfdhhsdf', username: 'Vincent', type: 'LOG2990', score: 50, position: '1' }];

        // check the content of the mocked call
        service.getLOG2990HighScore().subscribe((response: HighScores[]) => {
            expect(response).toEqual(expectedMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/highScore/log2990`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should return expected dictionaries list (HttpClient called once)', () => {
        const expectedMessage: Dictionary[] = [{ title: 'Mon dictionnaire', description: 'Une description', words: ['string'] }];

        // check the content of the mocked call
        service.getDictionaries().subscribe((dictionaries: Dictionary[]) => {
            expect(dictionaries).toEqual(expectedMessage);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/dictionary`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Dictionary = { title: 'Mon dictionnaire', description: 'Une description', words: ['string'] };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.addDictionary(sentMessage).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/dictionary/upload`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('should handle http error safely', () => {
        service.getLOG2990HighScore().subscribe((response: HighScores[]) => {
            expect(response).toEqual([]);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/highScore/log2990`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });
});
