import { Objective } from '@common/interfaces/objective';
const descOneVowel = 'Former un mot comportant une seule voyelle avec minimum 4 lettres';
const descPalindromicWord = 'Former un palindrome avec un minimum de 3 lettres';
const descAlphabeticalWord = 'Former un mot avec les lettres placées en ordre alphabétique';
const descMoreThan10Letters = 'Former un mot ayant plus de 10 lettres';
const descClueCommand = 'Jouer une partie sans utiliser la commande indice';
const descFiveLettersPlacedTwice = 'Placer 5 lettres ou plus 2 tours de suite';
const descThreeWordsFormed = 'Placer 3 mots ou plus en un seul tour';
const descTwoSameWords = 'Placer 2 mots pareils collés en un seul tour';

export const oneVowelWord: Objective = { name: 'OneVowelWord', points: 15, type: 'Word', description: descOneVowel } as Objective;
export const palindromicWord: Objective = { name: 'PalindromicWord', points: 0, type: 'Word', description: descPalindromicWord } as Objective;
export const alphabeticalWord: Objective = { name: 'AlphabeticalWord', points: 20, type: 'Word', description: descAlphabeticalWord } as Objective;
export const moreThan10Letters: Objective = { name: 'MoreThan10Letters', points: 20, type: 'Word', description: descMoreThan10Letters } as Objective;
export const threeWordsFormed: Objective = { name: 'ThreeWordsFormed', points: 0, type: 'Word', description: descThreeWordsFormed } as Objective;
export const twoSameWords: Objective = { name: 'TwoSameWords', points: 20, type: 'Word', description: descTwoSameWords } as Objective;
export const fiveLettersPlacedTwice: Objective = {
    name: 'FiveLettersPlaced',
    points: 20,
    type: 'Turn',
    description: descFiveLettersPlacedTwice,
} as Objective;
export const clueCommandNeverUsed: Objective = {
    name: 'ClueCommandNeverUsed',
    points: 45,
    type: 'ClueCommand',
    description: descClueCommand,
} as Objective;
export const objectivesList: Objective[] = [
    oneVowelWord,
    palindromicWord,
    alphabeticalWord,
    moreThan10Letters,
    threeWordsFormed,
    twoSameWords,
    fiveLettersPlacedTwice,
    clueCommandNeverUsed,
];
