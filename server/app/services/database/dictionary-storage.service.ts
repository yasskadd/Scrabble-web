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

    async removeDictionary(dictionary: Document) {
        if (!(await this.dictionaryIsInDb(dictionary.title))) return;
        await this.database.dictionaries.removeDocument(dictionary);
    }

    async modifyDictionary(dictionaryInfo: ModifiedDictionaryInfo) {
        if (!(await this.dictionaryIsInDb(dictionaryInfo.oldTitle))) return;
        await this.database.dictionaries.updateDocument(
            { title: dictionaryInfo.oldTitle },
            { $set: { title: dictionaryInfo.newTitle, description: dictionaryInfo.newDescription } },
        );
    }

    async dictionaryIsInDb(title: string): Promise<boolean> {
        // eslint-disable-next-line object-shorthand
        const document = await this.database.dictionaries.fetchDocuments({ title: title }, { projection: { title: 1 } });
        return document.length ? true : false;
    }

    // async populateDb() {
    //     const inDb = await this.dictionaryIsInDb('Mon dictionnaire');
    //     if (inDb) return;
    //     const jsonDictionary = JSON.parse(fs.readFileSync('../common/assets/spanish.json', 'utf8'));

    //     await this.addDictionary(jsonDictionary);
    // }
}
