import { Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { HttpHandlerService } from './communication/http-handler.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    constructor(private readonly httpHandler: HttpHandlerService) {}

    async addDictionary(dictionary: Dictionary): Promise<Dictionary[]> {
        this.httpHandler.addDictionary(dictionary).subscribe();
        return this.getDictionaries();
    }

    deleteDictionary(dictionarytoRemove: Dictionary) {
        this.httpHandler
            .deleteDictionary(dictionarytoRemove.title)
            .toPromise()
            .then(async () => this.getDictionaries());
    }

    modifyDictionary(dictionaryInfo: ModifiedDictionaryInfo) {
        this.httpHandler.modifyDictionary(dictionaryInfo).subscribe();
        this.getDictionaries();
    }

    resetDictionaries() {
        this.httpHandler.resetDictionaries().subscribe();
        this.getDictionaries();
    }

    async getDictionaries(): Promise<Dictionary[]> {
        return this.httpHandler.getDictionaries().toPromise();
    }
}
