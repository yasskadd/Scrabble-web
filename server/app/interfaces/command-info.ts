import { LetterTile } from '@common/services/letter-tile.class';

export interface CommandInfo {
    firstCoordinate: LetterTile;
    direction: string;
    lettersPlaced: string[];
}
