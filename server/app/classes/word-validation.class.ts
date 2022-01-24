// TODO : Import dictionnary
import dictionary from 'dictionnary.json';

let OurDictionary = new Set<string>();

dictionary.forEach((word: string) => {
    OurDictionary.add(word);
});

// detect words

// validate words

let enteredWords: Array<string> = [];

enteredWords.forEach((enteredWord:string) =>
    if (OurDictionary.has(enteredWord)){
        enteredWord.isValid = true;
    }
    else {
        enteredWord.isValid = false;
        // replacer les lettres sur le chevalet
    }
)