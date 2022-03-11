import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpHandlerService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getClassicHighScore(): Observable<HighScores[]> {
        return this.http
            .get<HighScores[]>(`${this.baseUrl}/highScore/classique`)
            .pipe(catchError(this.handleError<HighScores[]>('getClassicHighScore', [])));
    }

    getLOG2990HighScore(): Observable<HighScores[]> {
        return this.http
            .get<HighScores[]>(`${this.baseUrl}/highScore/log2990`)
            .pipe(catchError(this.handleError<HighScores[]>('getLOG2990cHighScore', [])));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
