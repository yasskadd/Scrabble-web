import { Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { HttpHandlerService } from './communication/http-handler.service';

const MAX_TITLE_CHAR = 30;
const MAX_DESCRIPTION_CHAR = 125;

@Injectable({
    providedIn: 'root',
})
export class DictionaryVerificationService {
    dictionaries: Dictionary[];

    constructor(private readonly httpHandler: HttpHandlerService) {
        this.httpHandler.getDictionaries().subscribe((dictionaries) => (this.dictionaries = dictionaries));
    }
    globalVerification(dictionary: Dictionary): string {
        if (!this.isDictionary(dictionary)) return 'The uploaded file is not a dictionary. You maybe missing a title, a description or a words list';
        if (this.fieldEmptyVerification(dictionary) !== 'Passed') return this.fieldEmptyVerification(dictionary);
        if (this.fieldLimitVerification(dictionary) !== 'Passed') return this.fieldLimitVerification(dictionary);
        if (this.alreadyExist(dictionary.title) !== 'Passed') return this.alreadyExist(dictionary.title);
        return 'Passed';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isDictionary(dictionary: any): boolean {
        if ('title' && 'description' && 'words' in dictionary) {
            if (typeof dictionary.title === 'string' && typeof dictionary.description === 'string' && this.wordsListIsValid(dictionary.words))
                return true;
            return false;
        }

        return false;
    }

    private fieldEmptyVerification(dictionary: Dictionary): string {
        if (this.fieldIsEmpty(dictionary.title)) return "This dictionary doesn't have a title";
        if (this.fieldIsEmpty(dictionary.description)) return "This dictionary doesn't have a description";
        if (this.fieldIsEmpty(dictionary.words)) return "This dictionary doesn't have words";
        return 'Passed';
    }

    private fieldLimitVerification(dictionary: Dictionary): string {
        if (this.fieldCharacterLimit(dictionary.title.split(''), MAX_TITLE_CHAR)) return 'This dictionary title is too long!';
        if (this.fieldCharacterLimit(dictionary.description.split(''), MAX_DESCRIPTION_CHAR)) return 'This dictionary description is too long!';
        return 'Passed';
    }

    private fieldIsEmpty(field: unknown[] | string): boolean {
        if (typeof field === 'string') return (field as string).trim().length === 0;
        return field.length === 0;
    }

    private fieldCharacterLimit(array: unknown[], maxLimit: number): boolean {
        return array.length > maxLimit;
    }

    private alreadyExist(title: string): string {
        this.httpHandler.getDictionaries().subscribe((dictionaries) => (this.dictionaries = dictionaries));
        if (this.dictionaries.some((dictionary) => dictionary.title === title)) return 'This dictionary already exist';
        return 'Passed';
    }

    private wordsListIsValid(words: unknown[]): boolean {
        if (Array.isArray(words)) {
            if (words.some((word) => !this.wordIsValid(word))) return false;
            return true;
        }
        return false;
    }

    private wordIsValid(word: unknown): boolean {
        if (typeof word !== 'string') return false;
        if (this.wordHasSpace(word)) return false;
        if (this.isOneLetterWord(word)) return false;
        if (this.wordHasHyphen(word)) return false;
        return true;
    }

    private wordHasSpace(word: string): boolean {
        if (word.indexOf(' ') >= 0) return true;
        return false;
    }

    private isOneLetterWord(word: string): boolean {
        if (word.length === 1) return true;
        return false;
    }

    private wordHasHyphen(word: string): boolean {
        if (word.indexOf('-') >= 0) return true;
        return false;
    }
}
