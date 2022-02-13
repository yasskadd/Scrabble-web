import { Coordinate } from '@common/coordinate';

export interface CommandInfo {
    firstCoordinate: Coordinate;
    isHorizontal: boolean;
    lettersPlaced: string[];
}
