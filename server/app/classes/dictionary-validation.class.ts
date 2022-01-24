import { Word } from './word';

let dictionary = new Set<string>();

dictionary.forEach((word: string) => {
    OurDictionary.add(word);
});

function validateWords(enteredWords: Array<Word>) {
    enteredWords.forEach((enteredWord) => {
        if (dictionary.has(enteredWord.stringFormat)) {
            enteredWord.isValid = true;
        } else {
            enteredWord.isValid = false;
            // break (send message to take placed letters off board)
        }
    });
    // envoyer message pour placer lettres sur chevalet si on a
    // pas break, terminer le tour, ...
}
