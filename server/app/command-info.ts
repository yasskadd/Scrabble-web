import { LetterTile } from '@common/letter-tile.class';

export interface PlacementCommandInfo {
    firstCoordinate: LetterTile;
    direction: string;
    lettersPlaced: string[];
}
