import { DictionaryStorageService } from '@app/services/database/dictionary-storage.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = StatusCodes.CREATED;

@Service()
export class DictionaryController {
    router: Router;

    constructor(private readonly dictionaryStorage: DictionaryStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const dictionaries = await this.dictionaryStorage.getAllDictionary();
            res.json(dictionaries);
        });

        this.router.post('/upload', async (req: Request, res: Response) => {
            const dictionary = req.body;
            this.dictionaryStorage.addDictionary(dictionary);
            res.sendStatus(HTTP_STATUS_CREATED);
        });
    }
}
