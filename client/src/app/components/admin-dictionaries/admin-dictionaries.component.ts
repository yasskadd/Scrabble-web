import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxModifyDictionaryComponent } from '../dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';

interface Dictionary {
    title: string;
    description: string;
}

const defaultDict: Dictionary = {
    title: 'default',
    description: 'Default Dictionary',
};

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    dictionaries: Dictionary[] = [defaultDict, defaultDict, defaultDict, defaultDict];
    constructor(private modifyDictionaryDialog: MatDialog) {}

    deleteDictionary(dictionaryToDelete: Dictionary) {
        const index = this.dictionaries.findIndex((dictionaryInList) => dictionaryInList === dictionaryToDelete);
        this.dictionaries.splice(index, 1);
        // TODO: send delete to server
    }

    openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
        this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '500px',
            disableClose: true,
        });
    }
}
