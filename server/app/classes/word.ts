import { Letter } from './letter';

export interface Word extends Letter {
    stringFormat: string;
    lettersInOrder: Letter[];
    isValid: boolean;
    score: number;
}
