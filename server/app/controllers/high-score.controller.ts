import { ScoreStorageService } from '@app/services/database/score-storage.service';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Request, Response, Router } from 'express';
import * as logger from 'morgan';
import { Service } from 'typedi';

@Service()
export class HighScoreController {
    router: Router;

    constructor(private readonly scoreStorage: ScoreStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.use(logger('dev'));
        this.router.use(express.json());
        this.router.use(express.urlencoded({ extended: true }));
        this.router.use(cookieParser());
        this.router.use(cors());

        this.router.get('/classique', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const highScore = await this.scoreStorage.getClassicTopScores();
            res.json(highScore);
        });

        this.router.get('/log2990', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const highScore = await this.scoreStorage.getLOG2990TopScores();
            res.json(highScore);
        });
    }
}
