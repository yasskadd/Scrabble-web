import { Dictionary } from '@app/interfaces/dictionary';
import * as fs from 'fs';
import * as path from 'path';
import { Service } from 'typedi';

@Service()
export class DictionaryStorageService {
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
    }
}
