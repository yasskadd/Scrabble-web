import { Objective } from '@app/classes/objective.class';

export const oneVowelWord: Objective = { name: 'OneVowelWord', points: 15, pointsMultiplier: 1 } as Objective;
export const palindromicWord: Objective = { name: 'PalindromicWord', points: 30, pointsMultiplier: 1 } as Objective;
export const alphabeticalWord: Objective = { name: 'AlphabeticalWord', points: 20, pointsMultiplier: 1 } as Objective;
export const moreThan10Letters: Objective = { name: 'MoreThan10Letters', points: 20, pointsMultiplier: 1 } as Objective;
export const threeWordsFormed: Objective = { name: 'ThreeWordsFormed', points: 0, pointsMultiplier: 2 } as Objective;
export const twoSameWords: Objective = { name: 'TwoSameWords', points: 20, pointsMultiplier: 1 } as Objective;
