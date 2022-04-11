import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxAddDictionaryComponent } from '@app/components/dialog-box-add-dictionary/dialog-box-add-dictionary.component';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    constructor(public dictionaryService: DictionaryService, private modifyDictionaryDialog: MatDialog, private addDictionaryDialog: MatDialog) {
        this.updateDictionaryList();
    }

    get dictionaries(): Dictionary[] {
        return this.dictionaryService.dictionaries;
    }

    deleteDictionary(dictionaryToDelete: Dictionary) {
        this.updateDictionaryList();
        if (dictionaryToDelete.title === 'Dictionnaire très français') return;
        this.dictionaryService.deleteDictionary(dictionaryToDelete);
    }

    openAddDictionaryDialog() {
        this.addDictionaryDialog.open(DialogBoxAddDictionaryComponent, {
            width: '50%',
            disableClose: true,
        });
    }

    openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
        const dialogRef = this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: dictionaryToModify,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result: Dictionary) => {
            this.modifyDictionary(dictionaryToModify, result);
        });
    }

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    dictionaryIsUnchanged(currentDictionary: Dictionary, newDictionary: Dictionary) {
        return newDictionary.title === currentDictionary.title && newDictionary.description === currentDictionary.description;
    }

    modifyDictionary(currentDictionary: Dictionary, newDictionary: Dictionary) {
        if (this.dictionaryIsUnchanged(currentDictionary, newDictionary)) return;
        this.updateDictionaryList();
        if (this.isUniqueTitle(newDictionary.title)) this.dictionaryService.modifyDictionary(currentDictionary, newDictionary);
    }

    isDefault(dictionary: Dictionary) {
        return dictionary.title === 'Dictionnaire très francais';
    }

    resetDictionaries() {
        this.dictionaryService.resetDictionaries();
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }
}
