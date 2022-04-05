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

    verifyWordRelatedObjectives(allWordsFormed: Word[], player: Player): void {
        player.objectives.forEach((objective) => {
            const objectiveVerificationFunction = this.objectivesMap.get(objective) as CallableFunction;
            if (objectiveVerificationFunction(allWordsFormed) && objective.type === 'Word') {
                this.completeObjective(player, objective);
            }
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
        const privateObjective2 = ObjectivesInfo.objectivesList.splice(Math.floor(Math.random() * ObjectivesInfo.objectivesList.length), 1)[0];
        privateObjective2.isPublic = false;
        player1.objectives.push(publicObjective1, publicObjective2, privateObjective1);
        player2.objectives.push(publicObjective1, publicObjective2, privateObjective2);
    }

    private isWordWithOneVowel(words: Word[]): boolean {
        if (words[0].stringFormat.length < MINIMUM_LETTERS_ONE_VOWEL) return false;
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        let vowelCount = 0;
        const wordArray = words[0].stringFormat.toLowerCase().split('');
        wordArray.forEach((letter: string) => {
            if (vowels.includes(letter)) vowelCount++;
        });
        return vowelCount === 1;
    }

    private isPalindromicWord(words: Word[]): boolean {
        if (words[0].stringFormat.length < 1) return false;
        const wordArray = words[0].stringFormat.split('');
        return wordArray.join('') === [...wordArray].reverse().join('');
    }

    private isWordAlphabetical(words: Word[]): boolean {
        return words[0].stringFormat === words[0].stringFormat.split('').sort().join('');
    }

    private isWordMoreThan10Letters(words: Word[]): boolean {
        return words[0].stringFormat.length > MINIMUM_LETTERS_10;
    }

    private isThreeWordsFormed(words: Word[]): boolean {
        return words.length > 2;
    }

    private isSameWordTwoTimes(words: Word[]): boolean {
        words.forEach((word: Word) => {
            word.stringFormat.toLowerCase();
        });
        return words.length !== new Set(words).size;
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

    private completeObjective(player: Player, objective: Objective): void {
        if (objective.isPublic) {
            const firstPlayerObjectives: Objective[] = this.players[0].objectives;
            const secondPlayerObjectives: Objective[] = this.players[1].objectives;
            firstPlayerObjectives.splice(firstPlayerObjectives.indexOf(objective), 1);
            secondPlayerObjectives.splice(secondPlayerObjectives.indexOf(objective), 1);
        } else player.objectives.splice(player.objectives.indexOf(objective), 1);
        this.addObjectivePoints(player, objective);
    }
}
