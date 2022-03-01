import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

type ScoreInfo = { player: string; type: string; score: number };

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

    async addNewHighScore(scoreInfo: ScoreInfo) {
        console.log(scoreInfo);
        console.log(JSON.stringify(scoreInfo));
        await fetch(`${this.baseUrl}/highScore/classique`, {
            method: 'POST',
            body: JSON.stringify(scoreInfo),
            headers: {
                'content-type': 'application/json',
            },
        });
    }
}
