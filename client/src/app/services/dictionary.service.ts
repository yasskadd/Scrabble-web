import { ElementRef, Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryInfo } from '@app/interfaces/dictionary-info';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { HttpHandlerService } from './communication/http-handler.service';
import { DictionaryVerificationService } from './dictionary-verification.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    constructor(private readonly httpHandler: HttpHandlerService, private dictionaryVerification: DictionaryVerificationService) {}

    async addDictionary(dictionary: Dictionary): Promise<DictionaryInfo[]> {
        this.httpHandler.addDictionary(dictionary).subscribe();
        return this.getDictionaries();
    }

    deleteDictionary(dictionarytoRemove: DictionaryInfo) {
        this.httpHandler
            .deleteDictionary(dictionarytoRemove.title)
            .toPromise()
            .then(async () => this.getDictionaries());
    }

    modifyDictionary(dictionaryInfo: ModifiedDictionaryInfo) {
        this.httpHandler
            .modifyDictionary(dictionaryInfo)
            .toPromise()
            .then(async () => this.getDictionaries());
    }

    resetDictionaries() {
        this.httpHandler.resetDictionaries().subscribe();
        this.getDictionaries();
    }

    async getDictionaries(): Promise<DictionaryInfo[]> {
        return this.httpHandler.getDictionaries().toPromise();
    }

    async uploadDictionary(files: FileList, selectedFile: Dictionary | null, fileError: ElementRef, dictionaryList: DictionaryInfo[]) {
        if (files.length !== 0) {
            const fileReader = new FileReader();
            const content = await this.readFile(files[0], fileReader);
            this.updateDictionaryMessage(fileError, 'En vérification, veuillez patienter...', 'red');
            this.fileOnLoad(selectedFile, fileError, content, dictionaryList);
        } else this.updateDictionaryMessage(fileError, "Il n'y a aucun fichier séléctioné", 'red');
    }

    async fileOnLoad(
        selectedFile: Dictionary | null,
        fileError: ElementRef,
        newDictionary: Record<string, unknown>,
        // REASON : dictionaryList is used in admin-page and multiplayer-create-page
        // eslint-disable-next-line no-unused-vars
        dictionaryList: DictionaryInfo[],
    ) {
        const dictionaryVerification = await this.dictionaryVerification.globalVerification(newDictionary);
        if (dictionaryVerification !== 'Passed') this.updateDictionaryMessage(fileError, dictionaryVerification, 'red');
        else {
            selectedFile = newDictionary as unknown as Dictionary;
            this.httpHandler
                .addDictionary(selectedFile)
                .toPromise()
                .then(() => {
                    this.httpHandler.getDictionaries().subscribe((dictionaries) => (dictionaryList = dictionaries));
                    this.updateDictionaryMessage(fileError, 'Ajout avec succès du nouveau dictionnaire', 'black');
                });
        }
    }

    updateDictionaryMessage(fileError: ElementRef, message: string, color: string) {
        fileError.nativeElement.textContent = message;
        fileError.nativeElement.style.color = color;
    }

    private async readFile(selectedFile: File, fileReader: FileReader): Promise<Record<string, unknown>> {
        return new Promise((resolve, reject) => {
            fileReader.readAsText(selectedFile, 'UTF-8');
            fileReader.onload = () => {
                resolve(JSON.parse(fileReader.result as string));
            };
            fileReader.onerror = () => {
                reject(Error('File is not a JSON'));
            };
        });
    }
}
