import { DictionaryStorageService } from '@app/services/database/dictionary-storage.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class DictionaryController {
    router: Router;

    constructor(private readonly dictionaryStorage: DictionaryStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            const dictionaries = await this.dictionaryStorage.getAllDictionaryInfo();
            res.json(dictionaries);
        });

        this.router.post('/upload', async (req: Request, res: Response) => {
            const dictionary = req.body;
            this.dictionaryStorage.addDictionary(dictionary);
            res.sendStatus(201);
        });
    }
}
