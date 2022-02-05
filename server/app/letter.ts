import { Word } from '../app/classes/word.class';

export interface Letter extends Word {
    stringChar: string;
    quantity: number;
    points: number;
}
