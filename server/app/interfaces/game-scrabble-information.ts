// import { Dictionary } from './dictionary';

export interface GameScrabbleInformation {
    playerName: string[];
    roomId: string;
    timer: number;
    socketId: string[];
    mode: string;
    botDifficulty?: string;
    // dictionary: Dictionary;
    dictionary: string;
}
