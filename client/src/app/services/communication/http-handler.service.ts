import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bot } from '@app/interfaces/bot';
import { Dictionary } from '@app/interfaces/dictionary';
import { HighScores } from '@app/interfaces/high-score-parameters';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

type BotNameInfo = { currentName: string; newName: string; difficulty: string };

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

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(`${this.baseUrl}/dictionary`).pipe(catchError(this.handleError<Dictionary[]>('getDictionaries', [])));
    }

    addDictionary(dictionary: Dictionary): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/dictionary/upload`, dictionary).pipe(catchError(this.handleError<void>('addDictionary')));
    }

    getBeginnerBots(): Observable<Bot[]> {
        return this.http.get<Bot[]>(`${this.baseUrl}/virtualPlayer/beginner`).pipe(catchError(this.handleError<Bot[]>('getBotsBeginner', [])));
    }

    getExpertBots(): Observable<Bot[]> {
        return this.http.get<Bot[]>(`${this.baseUrl}/virtualPlayer/expert`).pipe(catchError(this.handleError<Bot[]>('getBotsExpert', [])));
    }

    addBot(bot: Bot): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/virtualPlayer/upload`, bot).pipe(catchError(this.handleError<void>('addBot')));
    }

    replaceBot(bot: BotNameInfo): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/virtualPlayer/replace`, bot).pipe(catchError(this.handleError<void>('replaceBot')));
    }

    resetBot(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/virtualPlayer/reset`).pipe(catchError(this.handleError<void>('resetBot')));
    }

    deleteBot(bot: Bot): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/virtualPlayer/remove`, bot).pipe(catchError(this.handleError<void>('deleteBot')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
