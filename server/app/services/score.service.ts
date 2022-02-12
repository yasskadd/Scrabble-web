import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/Word.class';
import { Coordinate } from '@common/Coordinate';
import { Service } from 'typedi';

export const INDEX_NOT_FOUND = -1;

@Service()
export class ScoreService {
    word: Word;

    calculateWordPoints(gameboard: Gameboard) {
        this.addLetterPoints(gameboard);
        this.addWordMultiplierPoints(gameboard);
        return this.word.points;
    }

    private addLetterPoints(gameboard: Gameboard) {
        this.word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'LETTRE' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                this.word.points += gameboard.getLetterTile(coord).points * gameboard.getLetterTile(coord).multiplier.number;
            else this.word.points += gameboard.getLetterTile(coord).points;
        });
    }

    private addWordMultiplierPoints(gameboard: Gameboard) {
        this.word.wordCoords.forEach((coord: Coordinate) => {
            if (
                gameboard.getLetterTile(coord).multiplier.type === 'MOT' &&
                gameboard.getLetterTile(coord).multiplier.number > 1 &&
                this.word.newLetterCoords.indexOf(coord) > INDEX_NOT_FOUND
            )
                this.word.points *= gameboard.getLetterTile(coord).multiplier.number;
        });
    }
}
