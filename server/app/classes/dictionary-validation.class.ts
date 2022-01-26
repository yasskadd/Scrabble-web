import dictionnaryData from '../app/assets/dictionary.json';
import { Word } from './word';

// TODO : import dictionary
let dictionary = new Set<string>();

dictionnaryData.words.forEach((word: string) => {
    dictionary.add(word);
});

// TODO : detect words (once placement validation is done)

// TODO : validate detected words
function validateWords(enteredWords: Array<Word>) {
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
    // TODO : if at least one word is not valid.
    // (in client) flash invalid words red +
    // envoyer requete pour enlever lettres du grid.
    // TODO : else, envoyer requete pour compter les points.
}
