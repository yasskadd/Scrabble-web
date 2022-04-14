import { ElementRef, Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryInfo } from '@app/interfaces/dictionary-info';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { HttpHandlerService } from './communication/http-handler.service';
import { DictionaryVerificationService } from './dictionary-verification.service';
import { GameConfigurationService } from './game-configuration.service';

const TIMEOUT_POST = 5000;
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

    async uploadDictionary(
        gameConfiguration: GameConfigurationService | null,
        file: ElementRef,
        selectedFile: Dictionary | null,
        fileError: ElementRef,
    ) {
        if (file.nativeElement.files.length !== 0) {
            const fileReader = new FileReader();
            const content = await this.readFile(file.nativeElement.files[0], fileReader);
            this.updateDictionaryMessage(fileError, 'En vérification, veuillez patienter...', 'red');
            this.fileOnLoad(gameConfiguration, selectedFile, fileError, content);
        } else {
            this.updateDictionaryMessage(fileError, "Il n'y a aucun fichier séléctioné", 'red');
        }
    }

    fileOnLoad(
        gameConfiguration: GameConfigurationService | null,
        selectedFile: Dictionary | null,
        fileError: ElementRef,
        newDictionary: Record<string, unknown>,
    ) {
        if (this.dictionaryVerification.globalVerification(newDictionary) !== 'Passed') {
            this.updateDictionaryMessage(fileError, this.dictionaryVerification.globalVerification(newDictionary), 'red');
        } else {
            selectedFile = newDictionary as unknown as Dictionary;
            this.httpHandler.addDictionary(selectedFile).subscribe();
            setTimeout(() => {
                if (gameConfiguration) gameConfiguration.importDictionary((selectedFile as Dictionary).title);
                this.updateDictionaryMessage(fileError, 'Ajout avec succès du nouveau dictionnaire', 'black');
            }, TIMEOUT_POST);
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
