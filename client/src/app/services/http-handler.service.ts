import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpHandlerService {
    private readonly baseUrl: string = environment.serverUrl;

    async getClassicHighScore() {
        const score = await fetch(`${this.baseUrl}/highScore/classique`);
        return score.json();
    }

    async getLOG2990cHighScore() {
        const score = await fetch(`${this.baseUrl}/highScore/log2990`);
        return score.json();
    }
}
