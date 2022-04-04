import { Objective } from '@app/classes/objective.class';
import { Player } from '@app/classes/player/player.class';
import { Word } from '@app/classes/word.class';
import * as ObjectivesInfo from '@app/constants/objectives';

const MINIMUM_LETTERS_ONE_VOWEL = 5;
const MINIMUM_LETTERS_10 = 10;

export class ObjectivesHandler {
    players: [Player, Player];
    objectivesMap: Map<Objective, CallableFunction> = new Map();

    constructor(player1: Player, player2: Player) {
        this.players = [player1, player2];
    }

    completePublicObjective() {}

    completePrivateObjective() {}

    attributeObjectives(player1: Player, player2: Player) {
        // Set public and private objectives
        const publicObjective1 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1);
        const publicObjective2 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1);
        const privateObjective1 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1);
        const privateObjectivE2 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1);
        player1.objectives.push(publicObjective1, publicObjective2, privateObjective1);
        player2.objectives.push(publicObjective1, publicObjective2, privateObjectivE2);
    }

    setMapObjectives() {
        this.objectivesMap.set(ObjectivesInfo.oneVowelWord, this.isWordWithOneVowel);
        this.objectivesMap.set(ObjectivesInfo.palindromicWord, this.isPalindromicWord);
        this.objectivesMap.set(ObjectivesInfo.alphabeticalWord, this.isWordAlphabetical);
        this.objectivesMap.set(ObjectivesInfo.moreThan10Letters, this.isWordMoreThan10Letters);
        this.objectivesMap.set(ObjectivesInfo.threeWordsFormed, this.isThreeWordsFormed);
        this.objectivesMap.set(ObjectivesInfo.twoSameWords, this.isSameWordTwoTimes);
    }

    isWordWithOneVowel(word: Word) {
        if (word.stringFormat.length < MINIMUM_LETTERS_ONE_VOWEL) return false;
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        let vowelCount = 0;
        const wordArray = word.stringFormat.toLowerCase().split('');
        wordArray.forEach((letter: string) => {
            if (vowels.includes(letter)) vowelCount++;
        });
        return vowelCount === 1;
    }

    isPalindromicWord(word: Word) {
        if (word.stringFormat.length < 1) return false;
        const wordArray = word.stringFormat.split('');
        return wordArray === wordArray.reverse();
    }

    isWordAlphabetical(word: Word) {
        return word.stringFormat === word.stringFormat.split('').sort().join('');
    }

    isWordMoreThan10Letters(word: Word) {
        return word.stringFormat.length > MINIMUM_LETTERS_10;
    }

    isThreeWordsFormed(allWords: Word[]) {
        return allWords.length > 2;
    }

    isSameWordTwoTimes(allWords: Word[]) {
        allWords.forEach((word: Word) => {
            word.stringFormat.toLowerCase();
        });
        return allWords.length !== new Set(allWords).size;
    }
}
