import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { Document } from 'mongodb';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class DictionaryStorageService {
    constructor(private database: DatabaseService) {}

    async getAllDictionary(): Promise<Document[]> {
        return await this.database.dictionaries.fetchDocuments({});
    }

    async addDictionary(dictionary: Document) {
        if (await this.dictionaryIsInDb(dictionary.title)) return;
        await this.database.dictionaries.addDocument(dictionary);
    }

    async deleteDictionary(dictionary: Document) {
        console.log('dictionary storage delete entered');
        const dictionaryIsInDb: boolean = await this.dictionaryIsInDb(dictionary.title);
        if (!dictionaryIsInDb) return;
        await this.database.dictionaries.removeDocument({ title: dictionary.title });
    }

    async modifyDictionary(dictionaryInfo: ModifiedDictionaryInfo) {
        if (!(await this.dictionaryIsInDb(dictionaryInfo.title))) return;
        await this.database.dictionaries.updateDocument(
            { title: dictionaryInfo.title },
            { $set: { title: dictionaryInfo.newTitle, description: dictionaryInfo.newDescription } },
        );
    }

    async resetDictionaries() {
        await this.database.dictionaries.resetCollection();
    }

    async dictionaryIsInDb(title: string): Promise<boolean> {
        // eslint-disable-next-line object-shorthand
        const document = await this.database.dictionaries.fetchDocuments({ title: title }, { projection: { title: 1 } });
        return document.length ? true : false;
    }
}
