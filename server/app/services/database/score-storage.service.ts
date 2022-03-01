import { Document } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

type ScoreInfo = { username: string; type: string; score: number };

@Service()
export class ScoreStorageService {
    private static maxLength: number;
    private static lastElement: number;
    constructor(private database: DatabaseService) {
        ScoreStorageService.maxLength = 5;
        ScoreStorageService.lastElement = ScoreStorageService.maxLength + 1;
    }
    async addTopScores(scoreInfo: ScoreInfo) {
        await this.populateDb();
        const currentTopScores = await this.database.fetchDocuments({ type: scoreInfo.type });
        const scorePlace = this.getTopScoresPosition(currentTopScores, scoreInfo.score);
        if (scorePlace === ScoreStorageService.lastElement) return;
        const currentElement = currentTopScores.at(scorePlace - 1);
        if (currentElement !== undefined) {
            if (currentElement.score === scoreInfo.score && !this.isNameAlreadyThere(scoreInfo.username, currentElement.username)) {
                this.database.replaceDocument(
                    { position: scorePlace },
                    {
                        position: scorePlace,
                        username: currentElement.username + ' - ' + scoreInfo.username,
                        type: scoreInfo.type,
                        score: scoreInfo.score,
                    },
                );
            } else if (currentElement.score !== scoreInfo.score) {
                currentTopScores.forEach((value) => {
                    if (value.position >= scorePlace && value.position !== ScoreStorageService.lastElement) {
                        this.database.replaceDocument(
                            { position: value.position + 1 },
                            { position: value.position + 1, username: value.username, type: value.type, score: value.score },
                        );
                    }
                });
                this.database.replaceDocument(
                    { position: scorePlace },
                    { position: scorePlace, username: scoreInfo.username, type: scoreInfo.type, score: scoreInfo.score },
                );
            }
        }
    }
    async getLOG2990TopScores(): Promise<Document[]> {
        await this.populateDb();
        const currentTopScores = await this.database.fetchDocuments({ type: 'LOG2990' });
        return currentTopScores;
    }
    async getClassicTopScores(): Promise<Document[]> {
        await this.populateDb();
        const currentTopScores = await this.database.fetchDocuments({ type: 'Classique' });
        return currentTopScores;
    }

    private async populateDb() {
        const currentTopScores = await this.database.fetchDocuments({});
        if (currentTopScores.length !== 0) return;
        const dummyClassicScoreInfo = (() => {
            let i = 1;
            return () => {
                return { username: 'Tarnished', type: 'Classique', score: 0, position: i++ };
            };
        })();
        const dummyLOG2990ScoreInfo = (() => {
            let i = 1;
            return () => {
                return { username: 'EldenLord', type: 'LOG2990', score: 0, position: i++ };
            };
        })();
        for (let i = 0; i < ScoreStorageService.maxLength; i++) {
            await this.database.addDocument(dummyClassicScoreInfo());
            await this.database.addDocument(dummyLOG2990ScoreInfo());
        }
    }

    private getTopScoresPosition(currentTopScores: Document[], score: number): number {
        const scores = currentTopScores.map((element) => element.score as number);
        scores.push(score);
        scores.sort((a, b) => {
            return b - a;
        });
        return scores.indexOf(score) + 1;
    }
    private isNameAlreadyThere(newPlayer: string, currentPlayer: string): boolean {
        const playerName = currentPlayer.split(' - ');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (playerName.indexOf(newPlayer) === -1) return false;
        return true;
    }
}
