import { Gameboard } from '@app/classes/gameboard.class';
import { Word } from '@app/classes/word.class';
import { Coordinate } from '@common/coordinate';
import { Service } from 'typedi';

const ROW_NUMBER = 15;
const COLUMN_NUMBER = 15;

@Service()
export class WordFinderService {
    allWords: Word[] = [];

    findAdjacentWords(word: Word, gameboard: Gameboard): Word[] {
        this.allWords.push(word);
        this.findWords(word, gameboard);
        return this.allWords;
    }

    private findWords(word: Word, gameboard: Gameboard) {
        word.newLetterCoords.forEach((coord) => {
            const backwardPosition: Coordinate = word.isHorizontal ? { x: coord.x, y: coord.y - 1 } : { x: coord.x - 1, y: coord.y };
            const forwardPosition: Coordinate = word.isHorizontal ? { x: coord.x, y: coord.y + 1 } : { x: coord.x + 1, y: coord.y };

            if (gameboard.getLetterTile(backwardPosition).isOccupied) {
                while (gameboard.getLetterTile(backwardPosition).isOccupied) {
                    if (word.isHorizontal) backwardPosition.y--;
                    else backwardPosition.x--;
                }
                this.allWords.push(
                    new Word(
                        {
                            firstCoordinate: backwardPosition,
                            isHorizontal: !word.isHorizontal,
                            letters: [gameboard.getLetterTile(backwardPosition).getLetter()],
                        },
                        gameboard,
                    ),
                );
            } else if (gameboard.getLetterTile(forwardPosition).isOccupied)
                this.allWords.push(
                    new Word(
                        {
                            firstCoordinate: coord,
                            isHorizontal: !word.isHorizontal,
                            letters: [gameboard.getLetterTile(coord).getLetter()],
                        },
                        gameboard,
                    ),
                );
        });
    }
}
