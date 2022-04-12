import { ElementRef, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Dictionary } from '@app/interfaces/dictionary';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';
import { HttpHandlerService } from './communication/http-handler.service';
import { DictionaryVerificationService } from './dictionary-verification.service';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    constructor(private readonly httpHandler: HttpHandlerService, private dictionaryVerification: DictionaryVerificationService) {}

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

    detectImportFile(file: ElementRef, selectedFile: Dictionary | null, fileError: ElementRef, form: FormGroup) {
        fileError.nativeElement.textContent = '';
        if (file.nativeElement.files.length !== 0) form.controls.dictionary.disable();
        else {
            selectedFile = null;
            form.controls.dictionary.enable();
        }
    }

    uploadDictionary(file: ElementRef, selectedFile: Dictionary | null, fileError: ElementRef) {
        if (file.nativeElement.files.length !== 0) {
            const fileReader = new FileReader();
            fileReader.readAsText(file.nativeElement.files[0], 'UTF-8');
            fileReader.onload = () => {
                const newDictionary = JSON.parse(fileReader.result as string);
                if (this.dictionaryVerification.globalVerification(newDictionary) !== 'Passed')
                    this.updateImportMessage(fileError, this.dictionaryVerification.globalVerification(newDictionary), 'red');
                else {
                    this.updateImportMessage(fileError, 'Ajout avec succès du nouveau dictionnaire', 'black');
                    selectedFile = newDictionary;
                    this.httpHandler.addDictionary(newDictionary).subscribe();
                }
            };
        } else {
            this.updateImportMessage(fileError, "Il n'y a aucun fichier séléctioné", 'red');
        }
    }

    updateImportMessage(fileError: ElementRef, message: string, color: string) {
        fileError.nativeElement.textContent = message;
        fileError.nativeElement.style.color = color;
    }
}
