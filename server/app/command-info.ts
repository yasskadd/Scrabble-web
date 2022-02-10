import { GameboardCoordinate } from './classes/gameboard-coordinate.class';

export interface PlacementCommandInfo {
    firstCoordinate: GameboardCoordinate;
    direction: string;
    lettersPlaced: string[];
}
