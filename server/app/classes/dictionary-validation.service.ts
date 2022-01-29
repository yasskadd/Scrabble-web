// eslint-disable-next-line no-restricted-imports
import * as dictionnaryJson from '../../assets/dictionary.json';
// eslint-disable-next-line no-restricted-imports
import { Word } from '../classes/word';

const dictionary = new Set<string>();
// IS ANY LEGIT?
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
(<unknown>dictionnaryJson).words.forEach((word: string) => {
    dictionary.add(word);
});

function validateWords(enteredWords: Word[]) {
    // vérifier que les mots sont valides
    enteredWords.forEach((enteredWord) => {
        if (!dictionary.has(enteredWord.stringFormat)) {
            enteredWord.isValid = false;
            console.log(enteredWord + 'is not valid');
        } else {
            enteredWord.isValid = true;
            console.log(enteredWord + 'is not valid');
        }
    });

    const invalidWords = enteredWords.filter((word) => {
        word.isValid = false;
    });

    if (!invalidWords) {
        // TODO : calculatePoints() + endTurn()
    } else {
        // TODO : flash invalideWords red and removeLetters();
    }
}
