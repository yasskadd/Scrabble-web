import { Letter } from './letter';

export interface Word extends Letter {
    lettersInOrder: Array<Letter>;
    stringFormat: string;
    isValid: boolean;
    score: number;
}
