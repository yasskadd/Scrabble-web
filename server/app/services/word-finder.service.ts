import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Coordinate } from '@common/coordinate';
import { Service } from 'typedi';

@Service()
export class WordFinderService {
    allWords: Word[] = [];

    findAjacentWords(word: Word, gameboard: Gameboard): Word[] {
        this.allWords.push(word);
        if (word.isHorizontal) this.findAdjacentVerticalWords(word, gameboard);
        else this.findAdjacentHorizontalWords(word, gameboard);
        return this.allWords;
    }

    private findAdjacentVerticalWords(word: Word, gameboard: Gameboard) {
        word.newLetterCoords.forEach((coord) => {
            const upPosition: Coordinate = { x: coord.x, y: coord.y - 1 };
            const downPosition: Coordinate = { x: coord.x, y: coord.y + 1 };

            if (gameboard.getLetterTile(upPosition).isOccupied) {
                while (gameboard.getLetterTile(upPosition).isOccupied) {
                    upPosition.y--;
                }
                this.allWords.push(new Word(!word.isHorizontal, upPosition, gameboard.getLetterTile(upPosition).value, gameboard));
            } else if (gameboard.getLetterTile(downPosition).isOccupied)
                this.allWords.push(new Word(!word.isHorizontal, coord, gameboard.getLetterTile(coord).value, gameboard));
        });
    }

    private findAdjacentHorizontalWords(word: Word, gameboard: Gameboard) {
        word.newLetterCoords.forEach((coord) => {
            const leftPosition: Coordinate = { x: coord.x - 1, y: coord.y };
            const rightPosition: Coordinate = { x: coord.x + 1, y: coord.y };
            if (gameboard.getLetterTile(leftPosition).isOccupied) {
                while (gameboard.getLetterTile(leftPosition).isOccupied) {
                    leftPosition.x--;
                }
                this.allWords.push(new Word(!word.isHorizontal, leftPosition, gameboard.getLetterTile(leftPosition).value, gameboard));
            } else if (gameboard.getLetterTile(rightPosition).isOccupied)
                this.allWords.push(new Word(!word.isHorizontal, coord, gameboard.getLetterTile(coord).value, gameboard));
        });
    }
}
