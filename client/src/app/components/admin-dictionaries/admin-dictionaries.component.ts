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
        this.dictionaryService.resetDictionaries();
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }
}
