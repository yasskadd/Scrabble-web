import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-dialog-box-add-dictionary',
    templateUrl: './dialog-box-add-dictionary.component.html',
    styleUrls: ['./dialog-box-add-dictionary.component.scss'],
})
export class DialogBoxAddDictionaryComponent implements OnInit {
    myControl = new FormControl();
    options: string[] = ['DictionaryOne', 'DictionaryTwo', 'DictionaryThree'];
    filteredOptions: Observable<string[]>;
    form: FormGroup;
    selectedFile: Dictionary | null;
    @ViewChild('file', { static: false }) file: ElementRef;
    @ViewChild('fileError', { static: false }) fileError: ElementRef;

    constructor(private dialogRef: MatDialogRef<DialogBoxAddDictionaryComponent>) {}

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value)),
        );
    }

    detectImportFile() {
        this.fileError.nativeElement.textContent = '';
        if (this.file.nativeElement.files.length !== 0) this.form.controls.dictionary.disable();
        else {
            this.selectedFile = null;
            this.form.controls.dictionary.enable();
        }
    }

    updateImportMessage(message: string, color: string) {
        this.fileError.nativeElement.textContent = message;
        this.fileError.nativeElement.style.color = color;
    }

    addDictionary() {
        // TODO: add dictionary server side
        // TODO: update dictionary list client side
        this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
