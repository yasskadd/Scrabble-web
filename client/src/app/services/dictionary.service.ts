import { Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from './communication/http-handler.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    dictionaries: Dictionary[];
    constructor(private readonly httpHandler: HttpHandlerService) {}

    addDictionary(dictionary: Dictionary) {}

    deleteDictionary(dictionarytoRemove: Dictionary) {
        this.httpHandler
            .deleteDictionary(dictionarytoRemove)
            .toPromise()
            .then(() => this.getDictionaries());
    }

    resetDictionaries() {
        this.httpHandler
            .resetDictionary()
            .toPromise()
            .then(() => this.getDictionaries());
    }

    modifyDictionary(dictionaryToMod: Dictionary) {
        this.httpHandler
            .modifyDictionary(dictionaryToMod)
            .toPromise()
            .then(() => this.getDictionaries());
    }

    getDictionaries() {
        this.httpHandler.getDictionaries().subscribe((dictionary) => {
            this.dictionaries = dictionary;
        });
    }
}
