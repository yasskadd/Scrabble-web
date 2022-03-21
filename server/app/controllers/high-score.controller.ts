import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class HighScoreController {
    router: Router;

    constructor(private readonly scoreStorage: ScoreStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/classique', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const highScore = { title: 'HighScoreClassique', body: await this.scoreStorage.getClassicTopScores() };
            res.json(highScore);
        });

        this.router.get('/log2990', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const highScore = { title: 'HighScoreLOG2990', body: await this.scoreStorage.getLOG2990TopScores() };
            res.json(highScore);
        });
    }
}
