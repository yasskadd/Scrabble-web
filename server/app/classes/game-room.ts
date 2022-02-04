export interface GameRoom {
    id: string;
    isAvailable: boolean;
    users: string[];
    dictionary: string;
    timer: number;
    mode: string;
}
