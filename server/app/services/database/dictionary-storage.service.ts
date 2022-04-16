// import { Document } from 'mongodb';
import { Dictionary } from '@app/interfaces/dictionary';
import * as fs from 'fs';
import * as path from 'path';
import { Service } from 'typedi';

// import { DatabaseService } from './database.service';

@Service()
export class DictionaryStorageService {
    // constructor(private database: DatabaseService) {}
    constructor() {}

    // async getAllDictionary(): Promise<Document[]> {
    //     return await this.database.dictionaries.fetchDocuments({});
    // }

    // async getAllDictionaryInfo(): Promise<Document[]> {
    //     return await this.database.dictionaries.fetchDocuments({}, { projection: { title: 1, description: 1 } });
    // }

    // async selectDictionaryInfo(title: string): Promise<Document[]> {
    //     // eslint-disable-next-line object-shorthand
    //     return await this.database.dictionaries.fetchDocuments({ title: title });
    // }

    // async addDictionary(dictionary: Document) {
    //     if (await this.dictionaryIsInDb(dictionary.title)) return;
    //     await this.database.dictionaries.addDocument(dictionary);
    // }

    // async removeDictionary(dictionary: Document) {
    //     if (!(await this.dictionaryIsInDb(dictionary.title))) return;
    //     await this.database.dictionaries.removeDocument(dictionary);
    // }

    // async dictionaryIsInDb(title: string): Promise<boolean> {
    //     // eslint-disable-next-line object-shorthand
    //     const document = await this.database.dictionaries.fetchDocuments({ title: title }, { projection: { title: 1 } });
    //     return document.length ? true : false;
    // }

    async dictionaryIsInDb(fileName: string) {
        return await fs.promises.access(`./assets/${fileName}.json`, fs.constants.R_OK);
    }

    async addDictionary(fileName: string, data: string) {
        return await fs.promises.writeFile(`./assets/${fileName}.json`, data);
    }

    async deletedDictionary(fileName: string) {
        return await fs.promises.unlink(`./assets/${fileName}.json`);
    }

    async getDictionary(fileName: string): Promise<Buffer> {
        return await fs.promises.readFile(`./assets/${fileName}.json`);
    }

    async updateDictionary(oldDictionaryTitle: string, field: string, content: string) {
        const dictionaryToUpdate = JSON.parse((await this.getDictionary(oldDictionaryTitle)).toString());
        dictionaryToUpdate[field] = content;
        console.log(dictionaryToUpdate.title);
        await this.addDictionary(dictionaryToUpdate.title, JSON.stringify(dictionaryToUpdate));
        await this.deletedDictionary(oldDictionaryTitle);
    }

    async getDictionaries(): Promise<Dictionary[]> {
        const jsonsInDir = (await fs.promises.readdir('././assets/')).filter((file) => path.extname(file) === '.json');
        const dictionaries = jsonsInDir.map((file) => {
            const fileData = fs.readFileSync(path.join('././assets/', file));
            const json = JSON.parse(fileData.toString());
            return json;
        });
        return dictionaries;
        // const dictionaries = jsonsInDir.map(async (file) => {
        //     const buffer = await this.getDictionary(file);
        //     JSON.parse(buffer.toString());
        // });

        // return dictionaries as unknown as Promise<Dictionary[]>;
    }
}
