import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxAddDictionaryComponent } from '@app/components/dialog-box-add-dictionary/dialog-box-add-dictionary.component';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { ModifiedDictionaryInfo } from '@app/interfaces/modified-dictionary-info';
import { DictionaryService } from '@app/services/dictionary.service';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    availableDictionaries: Dictionary[]; // TODO : have available dictionaries in server!!

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
        const oldTitle = dictionaryToModify.title;
        const dialogRef = this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: dictionaryToModify,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.modifyDictionary({ oldTitle, newTitle: result.title, newDescription: result.description });
        });
    }

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    modifyDictionary(modifiedDictionaryInfo: ModifiedDictionaryInfo) {
        if (modifiedDictionaryInfo.oldTitle === '' || modifiedDictionaryInfo.newDescription === '') return;

        this.dictionaryService.getDictionaries();
        if (this.isUniqueTitle(modifiedDictionaryInfo.newTitle)) this.dictionaryService.modifyDictionary(modifiedDictionaryInfo);
    }

    isDefault(dictionary: Dictionary) {
        return dictionary.title === 'Dictionnaire très francais';
    }

    // TODO : return only default dictionary in list
    resetDictionaries() {
        this.availableDictionaries = [this.dictionaries[0]];
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }
}
