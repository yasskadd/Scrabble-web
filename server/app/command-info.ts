import { Coordinate } from '@common/coordinate';

export interface CommandInfo {
    firstCoordinate: Coordinate;
    direction: string;
    lettersPlaced: string[];
}
