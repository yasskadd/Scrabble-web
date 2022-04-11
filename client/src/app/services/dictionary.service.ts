import { Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { ModifiedDictionaryInfo } from '@app/interfaces/modified-dictionary-info';
import { HttpHandlerService } from './communication/http-handler.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    dictionaries: Dictionary[];
    constructor(private readonly httpHandler: HttpHandlerService) {}

    addDictionary(dictionary: Dictionary) {
        this.httpHandler
            .addDictionary(dictionary)
            .toPromise()
            .then(() => this.getDictionaries());
    }

    deleteDictionary(dictionarytoRemove: Dictionary) {
        this.httpHandler
            .deleteDictionary(dictionarytoRemove)
            .toPromise()
            .then(() => this.getDictionaries());
    }

    resetDictionaries() {
        this.httpHandler
            .deleteDictionaries()
            .toPromise()
            .then(() => this.getDictionaries());
    }

    modifyDictionary(dictionaryInfo: ModifiedDictionaryInfo) {
        this.httpHandler.modifyDictionary(dictionaryInfo).subscribe();
        this.getDictionaries();
    }

    getDictionaries() {
        this.httpHandler.getDictionaries().subscribe((dictionary) => {
            this.dictionaries = dictionary;
        });
    }
}
