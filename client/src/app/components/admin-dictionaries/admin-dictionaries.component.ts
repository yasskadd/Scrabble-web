import { Component } from '@angular/core';

// interface Dictionary {
//     title: string;
//     description: string;
// }

// const defaultDict: Dictionary = {
//     title: 'default',
//     description: 'Default Dictionary',
// };

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent {
    // dictionaries: Dictionary[] = [defaultDict, defaultDict, defaultDict, defaultDict];
    // constructor(private modifyDictionaryDialog: MatDialog, private addDictionaryDialog: MatDialog) {}
    // deleteDictionary(dictionaryToDelete: Dictionary) {
    //     const index = this.dictionaries.findIndex((dictionaryInList) => dictionaryInList === dictionaryToDelete);
    //     this.dictionaries.splice(index, 1);
    //     // TODO: send delete to server
    // }
    // openAddDictionaryDialog() {
    //     this.addDictionaryDialog.open(DialogBoxAddDictionaryComponent, {
    //         width: '50%',
    //         disableClose: true,
    //     });
    // }
    // openModifyDictionaryDialog(dictionaryToModify: Dictionary) {
    //     this.modifyDictionaryDialog.open(DialogBoxModifyDictionaryComponent, {
    //         width: '50%',
    //         data: dictionaryToModify,
    //         disableClose: true,
    //     });
    // }
}
