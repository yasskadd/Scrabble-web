import { Dictionary } from './dictionary';

export interface GameParameters {
    username: string;
    dictionary: Dictionary;
    timer: number;
    mode: string;
    isMultiplayer: boolean;
    opponent?: string;
    botDifficulty?: string;
}
