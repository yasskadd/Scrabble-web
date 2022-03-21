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

        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: HighScore
         *     description: HighScore endpoints
         */

        /**
         * @swagger
         *
         * /highScore/log2990:
         *   get:
         *     description: Return the LOG2990 highScore
         *     tags:
         *       - Score
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */

        /**
         * @swagger
         *
         * /highScore/classique:
         *   get:
         *     description: Return the classic highScore
         *     tags:
         *       - Score
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */

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
