import { Letter } from './letter';

export interface Word extends Letter {
    stringFormat: string;
    lettersInOrder: Array<Letter>;
    isValid: boolean;
    score: number;
}
