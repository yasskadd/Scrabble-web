import { Objective } from '@app/interfaces/objective';

export const oneVowelWord: Objective = { name: 'OneVowelWord', points: 15, type: 'Word' } as Objective;
export const palindromicWord: Objective = { name: 'PalindromicWord', points: 0, type: 'Word' } as Objective;
export const alphabeticalWord: Objective = { name: 'AlphabeticalWord', points: 20, type: 'Word' } as Objective;
export const moreThan10Letters: Objective = { name: 'MoreThan10Letters', points: 20, type: 'Word' } as Objective;
export const threeWordsFormed: Objective = { name: 'ThreeWordsFormed', points: 0, type: 'Word' } as Objective;
export const twoSameWords: Objective = { name: 'TwoSameWords', points: 20, type: 'Word' } as Objective;
export const fiveLettersPlacedTwice: Objective = { name: 'FiveLettersPlaced', points: 20, type: 'Turn' } as Objective;
export const clueCommandNeverUsed: Objective = { name: 'ClueCommandNeverUsed', points: 45, type: 'ClueCommand' } as Objective;
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
