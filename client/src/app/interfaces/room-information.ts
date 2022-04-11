// import { Dictionary } from './dictionary';

export interface RoomInformation {
    playerName: string[];
    roomId: string;
    isCreator: boolean;
    statusGame: string;
    mode: string;
    timer: number;
    botDifficulty?: string;
    // dictionary: Dictionary;
    dictionary: string;
}
