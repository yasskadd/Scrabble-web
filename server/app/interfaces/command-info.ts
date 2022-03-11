import { LetterTile } from '@common/classes/letter-tile.class';

export interface CommandInfo {
    firstCoordinate: LetterTile;
    direction: string;
    lettersPlaced: string[];
}
