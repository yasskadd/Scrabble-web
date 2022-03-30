import * as fs from 'fs';
import { Document } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class DictionaryStorageService {
    constructor(private database: DatabaseService) {}

    async getAllDictionary(): Promise<Document[]> {
        return await this.database.fetchDocuments({});
    }

    async addDictionary(dictionary: Document) {
        if (await this.dictionaryIsInDb(dictionary.title)) return;
        await this.database.addDocument(dictionary);
    }

    async removeDictionary(dictionary: Document) {
        if (!(await this.dictionaryIsInDb(dictionary.title))) return;
        await this.database.addDocument(dictionary);
    }

    async dictionaryIsInDb(title: string): Promise<boolean> {
        // eslint-disable-next-line object-shorthand
        const document = await this.database.fetchDocuments({ title: title }, { projection: { title: 1 } });
        return document.length ? true : false;
    }

    async populateDb() {
        const inDb = await this.dictionaryIsInDb('Mon dictionnaire');
        if (inDb) return;
        const jsonDictionary = JSON.parse(fs.readFileSync('../common/assets/spanish.json', 'utf8'));

        await this.addDictionary(jsonDictionary);
    }
}
