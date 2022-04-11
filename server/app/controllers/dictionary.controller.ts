import { DictionaryStorageService } from '@app/services/database/dictionary-storage.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = StatusCodes.CREATED;
const NO_CONTENT = 204;

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

        this.router.patch('/delete', async (req: Request, res: Response) => {
            const dictionaryTitle = req.body;
            console.log(dictionaryTitle);
            await this.dictionaryStorage.deleteDictionary(dictionaryTitle);
            res.sendStatus(NO_CONTENT);
        });

        this.router.get('/modify', async (req: Request, res: Response) => {
            const dictionaries = await this.dictionaryStorage.modifyDictionary(req.body);
            res.json(dictionaries);
        });

        this.router.post('/upload', async (req: Request, res: Response) => {
            this.dictionaryStorage.addDictionary(req.body);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        this.router.post('/reset', async (req: Request, res: Response) => {
            this.dictionaryStorage.resetDictionaries();
            res.sendStatus(NO_CONTENT);
        });
    }
}
