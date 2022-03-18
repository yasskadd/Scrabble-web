import { Coordinate } from '@common/interfaces/coordinate';

export interface CommandInfo {
    firstCoordinate: Coordinate;
    isHorizontal: boolean | undefined;
    letters: string[];
}
