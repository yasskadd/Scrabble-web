// import { Dictionary } from './dictionary';

export interface GameParameters {
    username: string;
    // dictionary: Dictionary;
    dictionary: string;
    timer: number;
    mode: string;
    isMultiplayer: boolean;
    opponent?: string;
    botDifficulty?: string;
}
