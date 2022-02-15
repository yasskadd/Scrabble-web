import { GameboardCoordinate } from './classes/gameboard-coordinate.class';

export interface CommandInfo {
    firstCoordinate: GameboardCoordinate;
    direction: string;
    lettersPlaced: string[];
}
