import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/Word.class';
import { Coordinate } from '@common/Coordinate';
import { Service } from 'typedi';

export const INDEX_NOT_FOUND = -1;

@Service()
export class ScoreService {
    calculateWordPoints(word: Word, gameboard: Gameboard): number {
        this.addLetterPoints(word, gameboard);
        this.addWordMultiplierPoints(word, gameboard);
        return word.points;
    }

    private addLetterPoints(word: Word, gameboard: Gameboard) {
        word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                word.points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
            else word.points += gameboard.getLetterTile(coord).points;
        });
    }

    private addWordMultiplierPoints(word: Word, gameboard: Gameboard) {
        word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'MOT' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                word.points *= gameboard.getLetterTile(coord).multiplier.number;
        });
    }
}
