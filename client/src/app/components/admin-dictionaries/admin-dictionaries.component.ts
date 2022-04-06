import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxAddDictionaryComponent } from '@app/components/dialog-box-add-dictionary/dialog-box-add-dictionary.component';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';

// TODO : make dictionary import service

const defaultDict: Dictionary = {
    title: 'default',
    description: 'Default Dictionary',
    words: [],
};

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    dictionaries: Dictionary[] = [defaultDict, defaultDict, defaultDict, defaultDict];

    constructor(public dictionaryService: DictionaryService, private modifyDictionaryDialog: MatDialog, private addDictionaryDialog: MatDialog) {
        this.updateDictionaryList();
    }

    deleteDictionary(dictionaryToDelete: Dictionary) {
        const index = this.dictionaries.findIndex((dictionaryInList) => dictionaryInList === dictionaryToDelete);
        this.dictionaries.splice(index, 1);
        this.dictionaryService.deleteDictionary(dictionaryToDelete);
    }

    openAddDictionaryDialog() {
        this.addDictionaryDialog.open(DialogBoxAddDictionaryComponent, {
            width: '50%',
            disableClose: true,
        });
    }
    openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
        this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: dictionaryToModify,
            disableClose: true,
        });
    }

    resetDictionaries() {
        this.dictionaries = [defaultDict];
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }
}
