import { Word } from '@app/classes/word.class';
import { Service } from 'typedi';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;

@Service()
export class WordFinderService {
    allWords: Word[] = [];
}
