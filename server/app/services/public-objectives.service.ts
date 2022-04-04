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
        this.setMapObjectives();
        this.attributeObjectives(player1, player2);
    }

    verifyObjectives(allWordsFormed: Word[], player: Player): void {
        player.objectives.forEach((objective) => {
            const objectiveVerificationFunction = this.objectivesMap.get(objective) as CallableFunction;
            if (objectiveVerificationFunction(allWordsFormed) && objective.type === 'Word') this.addObjectivePoints(player, objective);
        });
    }

    attributeObjectives(player1: Player, player2: Player): void {
        // Set public and private objectives
        const publicObjective1 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1)[0];
        publicObjective1.isPublic = true;
        const publicObjective2 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1)[0];
        publicObjective2.isPublic = true;
        const privateObjective1 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1)[0];
        privateObjective1.isPublic = false;
        const privateObjectivE2 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1)[0];
        privateObjectivE2.isPublic = false;
        player1.objectives.push(publicObjective1, publicObjective2, privateObjective1);
        player2.objectives.push(publicObjective1, publicObjective2, privateObjectivE2);
    }

    private isWordWithOneVowel(word: Word): boolean {
        if (word.stringFormat.length < MINIMUM_LETTERS_ONE_VOWEL) return false;
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        let vowelCount = 0;
        const wordArray = word.stringFormat.toLowerCase().split('');
        wordArray.forEach((letter: string) => {
            if (vowels.includes(letter)) vowelCount++;
        });
        return vowelCount === 1;
    }

    private isPalindromicWord(word: Word): boolean {
        if (word.stringFormat.length < 1) return false;
        const wordArray = word.stringFormat.split('');
        return wordArray === wordArray.reverse();
    }

    private isWordAlphabetical(word: Word): boolean {
        return word.stringFormat === word.stringFormat.split('').sort().join('');
    }

    private isWordMoreThan10Letters(word: Word): boolean {
        return word.stringFormat.length > MINIMUM_LETTERS_10;
    }

    private isThreeWordsFormed(allWords: Word[]): boolean {
        return allWords.length > 2;
    }

    private isSameWordTwoTimes(allWords: Word[]): boolean {
        allWords.forEach((word: Word) => {
            word.stringFormat.toLowerCase();
        });
        return allWords.length !== new Set(allWords).size;
    }

    private setMapObjectives(): void {
        this.objectivesMap.set(ObjectivesInfo.oneVowelWord, this.isWordWithOneVowel);
        this.objectivesMap.set(ObjectivesInfo.palindromicWord, this.isPalindromicWord);
        this.objectivesMap.set(ObjectivesInfo.alphabeticalWord, this.isWordAlphabetical);
        this.objectivesMap.set(ObjectivesInfo.moreThan10Letters, this.isWordMoreThan10Letters);
        this.objectivesMap.set(ObjectivesInfo.threeWordsFormed, this.isThreeWordsFormed);
        this.objectivesMap.set(ObjectivesInfo.twoSameWords, this.isSameWordTwoTimes);
    }

    private addObjectivePoints(player: Player, objective: Objective): void {
        player.score += objective.points;
        player.score *= objective.pointsMultiplier;
    }
}
