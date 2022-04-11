import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryService } from '@app/services/dictionary.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-dialog-box-add-dictionary',
    templateUrl: './dialog-box-add-dictionary.component.html',
    styleUrls: ['./dialog-box-add-dictionary.component.scss'],
})
export class DialogBoxAddDictionaryComponent implements OnInit {
    dictionaryInput: Dictionary;
    myControl = new FormControl();
    options: string[] = ['DictionaryOne', 'DictionaryTwo', 'DictionaryThree'];
    filteredOptions: Observable<string[]>;
    form: FormGroup;
    selectedFile: Dictionary | null;
    @ViewChild('file', { static: false }) file: ElementRef;
    @ViewChild('fileError', { static: false }) fileError: ElementRef;

    constructor(private dialogRef: MatDialogRef<DialogBoxAddDictionaryComponent>, private dictionaryService: DictionaryService) {}

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

    isUniqueTitle(title: string): boolean {
        return !this.dictionaryService.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === title.toString().toLowerCase());
    }

    resetDictionaryInput() {
        this.dictionaryInput = {} as Dictionary;
    }

    addDictionary() {
        this.updateDictionaryList();
        if (this.isUniqueTitle(this.dictionaryInput.title)) {
            this.dictionaryService.addDictionary(this.dictionaryInput);
        }
        this.resetDictionaryInput();
        this.closeDialog();
    }

    updateDictionaryList() {
        this.dictionaryService.getDictionaries();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
