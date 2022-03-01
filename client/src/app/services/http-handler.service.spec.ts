import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpHandlerService } from './http-handler.service';

// type ScoreInfo = { username: string; type: string; score: number };
describe('HttpHandlerService', () => {
    let service: HttpHandlerService;
    let httpMock: HttpTestingController;
    // let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HttpHandlerService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        //  baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should return expected message (HttpClient called once)', () => {
    //     // check the content of the mocked call
    //     service.getClassicHighScore();

    //     const req = httpMock.expectOne(`${baseUrl}/highScore/classique`);
    //     expect(req.request.method).toBe('GET');
    // });
});
