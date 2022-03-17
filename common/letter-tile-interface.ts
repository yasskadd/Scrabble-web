import { Coordinate } from '@common/interfaces/coordinate';
import { Multiplier } from '@common/interfaces/multiplier';

export interface LetterTileInterface {
    coordinate: Coordinate;
    isOccupied: boolean;
    _letter: string;
    points: number;
    multiplier: Multiplier;
}
