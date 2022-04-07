import { Dictionary } from './dictionary';

export interface GameRoomClient {
    id: string;
    users: string[];
    dictionary: Dictionary;
    timer: number;
    mode: string;
}
