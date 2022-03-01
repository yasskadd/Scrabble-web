import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const BAD_REQUEST = 400;
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
         *   - name: Time
         *     description: Time endpoints
         */

        /**
         * @swagger
         *
         * /api/date:
         *   get:
         *     description: Return current time
         *     tags:
         *       - Time
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

        this.router.post('/classique', async (req: Request, res: Response) => {
            console.log(req.body);
            // Send the request to the service and send the response
            if (!Object.keys(req.body).length) {
                res.status(BAD_REQUEST).send();
                return;
            }
            const newScore = req.body;

            await this.scoreStorage.addTopScores(newScore);
        });
        this.router.get('/log2990', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const highScore = await this.scoreStorage.getLOG2990TopScores();
            res.json(highScore);
        });
    }
}
