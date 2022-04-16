import { Dictionary } from '@app/interfaces/dictionary';
import { GamesHandler } from '@app/services/games-management/games-handler.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = StatusCodes.CREATED;
const HTTP_STATUS_NO_CONTENT = StatusCodes.NO_CONTENT;
const HTTP_STATUS_FOUND = StatusCodes.OK;

@Service()
export class DictionaryController {
    router: Router;

    constructor(private gamesHandler: GamesHandler) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/dictionaryisindb/:title', async (req: Request, res: Response) => {
            try {
                const title = req.params.title;
                await this.gamesHandler.dictionaryIsInDb(title);
                res.status(HTTP_STATUS_FOUND).send();
            } catch {
                res.status(HTTP_STATUS_NO_CONTENT).send();
            }
        });

        this.router.get('/info', async (req: Request, res: Response) => {
            const dictionaries = (await this.gamesHandler.getDictionaries()).map((dictionary: Dictionary) => ({
                title: dictionary.title,
                description: dictionary.description,
            }));
            res.json(dictionaries);
        });

        this.router.post('/upload', async (req: Request, res: Response) => {
            const dictionary = req.body;
            await this.gamesHandler.addDictionary(dictionary);
            res.sendStatus(HTTP_STATUS_CREATED);
        });
    }
}
