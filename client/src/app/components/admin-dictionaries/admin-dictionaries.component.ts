import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxAddDictionaryComponent } from '@app/components/dialog-box-add-dictionary/dialog-box-add-dictionary.component';
import { DialogBoxModifyDictionaryComponent } from '@app/components/dialog-box-modify-dictionary/dialog-box-modify-dictionary.component';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryInput } from '@app/interfaces/dictionary-input';
import { DictionaryService } from '@app/services/dictionary.service';
import { ModifiedDictionaryInfo } from '@common/interfaces/modified-dictionary-info';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    dictionaryInput: DictionaryInput;

    constructor(public dictionaryService: DictionaryService, private modifyDictionaryDialog: MatDialog, private addDictionaryDialog: MatDialog) {
        this.updateDictionaryList();
    }

    get dictionaries(): Dictionary[] {
        return this.dictionaryService.dictionaries;
    }

    isDefault(dictionary: Dictionary) {
        return dictionary.title === 'Dictionnaire très francais';
    }

    deleteDictionary(dictionaryToDelete: Dictionary) {
        this.updateDictionaryList();
        console.log('admin dictionary component delete entered');
        this.dictionaryService.deleteDictionary(dictionaryToDelete);
    }

    openAddDictionaryDialog() {
        this.addDictionaryDialog.open(DialogBoxAddDictionaryComponent, {
            width: '50%',
            disableClose: true,
        });
    }

    openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
        const title = dictionaryToModify.title;
        const dialogRef = this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
            width: '50%',
            data: dictionaryToModify,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.modifyDictionary({ title, newTitle: result.title, newDescription: result.description });
        });
    }

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    modifyDictionary(modifiedDictionaryInfo: ModifiedDictionaryInfo) {
        if (modifiedDictionaryInfo.title === '' || modifiedDictionaryInfo.newDescription === '') return;

        this.dictionaryService.getDictionaries();
        if (this.isUniqueTitle(modifiedDictionaryInfo.newTitle)) this.dictionaryService.modifyDictionary(modifiedDictionaryInfo);
    }

    // TODO : return only default dictionary in list
    resetDictionaries() {
        this.dictionaryService.resetDictionaries();
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }
}
