import { Component } from '@angular/core';

@Component({
    selector: 'app-dialog-box-add-dictionary',
    templateUrl: './dialog-box-add-dictionary.component.html',
    styleUrls: ['./dialog-box-add-dictionary.component.scss'],
})
export class DialogBoxAddDictionaryComponent {
    // myControl = new FormControl();
    // options: string[] = ['DictionaryOne', 'DictionaryTwo', 'DictionaryThree'];
    // filteredOptions: Observable<string[]>;
    // constructor(private dialogRef: MatDialogRef<DialogBoxAddDictionaryComponent>) {}
    // ngOnInit() {
    //     this.filteredOptions = this.myControl.valueChanges.pipe(
    //         startWith(''),
    //         map((value) => this._filter(value)),
    //     );
    // }
    // addDictionary() {
    //     // TODO: add dictionary server side
    //     // TODO: update dictionary list client side
    //     this.closeDialog();
    // }
    // closeDialog() {
    //     this.dialogRef.close();
    // }
    // private _filter(value: string): string[] {
    //     const filterValue = value.toLowerCase();
    //     return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    // }
}
