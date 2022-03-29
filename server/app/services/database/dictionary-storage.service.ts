import { Document } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class DictionaryStorageService {
    constructor(private database: DatabaseService) {}

    async getAllDictionaryInfo(): Promise<Document[]> {
        return await this.database.fetchDocuments({}, { projection: { title: 1, description: 1 } });
    }

    async addDictionary(dictionary: Document) {
        if (await this.dictionaryIsInDB(dictionary.title)) return;
        await this.database.addDocument(dictionary);
    }

    async removeDictionary(dictionary: Document) {
        if (!(await this.dictionaryIsInDB(dictionary.title))) return;
        await this.database.addDocument(dictionary);
    }

    async dictionaryIsInDB(title: string): Promise<boolean> {
        // eslint-disable-next-line object-shorthand
        const document = await this.database.fetchDocuments({ title: title }, { projection: { title: 1 } });
        return document.length ? true : false;
    }
}
