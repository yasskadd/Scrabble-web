import { GamesHandler } from '@app/services/games-management/games-handler.service';
import { GamesStateService } from '@app/services/games-management/games-state.service';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

type GameInfo = {
    mode: string;
    abandoned: boolean;
    beginningTime: string;
    endTime: string;
    length: string;
    firstPlayerName: string;
    firstPlayerScore: number;
    secondPlayerName: string;
    secondPlayerScore: number;
};

const SECOND_IN_MILLISECOND = 1000;
const SECOND_MINUTE_HOUR_MAX_VALUE = 60;
const MINIMUM_TWO_UNITS = 10;

@Service()
export class HistoryStorageService {
    constructor(private databaseService: DatabaseService, private gamesState: GamesStateService, private gamesHandler: GamesHandler) {
        this.gamesState.gameEnded.subscribe();
    }

    // handleEndGame() {}

    // addToHistory() {}

    getHistory(): GameInfo[] {
        const games = this.databaseService.histories.fetchDocuments({}) as unknown as GameInfo[];
        return games;
    }

    // clearHistory() {}

    formatGameInfo(room: string): GameInfo {
        const players = this.gamesHandler.gamePlayers.get(room);
        if (players === undefined) return {} as GameInfo;
        const endTime = new Date();
        return {
            mode: players[0].game.gameMode,
            abandoned: players[0].game.isGameAbandoned,
            beginningTime: players[0].game.beginningTime.toString(),
            endTime: endTime.toString(),
            length: this.computeTimeLength(players[0].game.beginningTime, endTime),
            firstPlayerName: players[0].name,
            firstPlayerScore: players[0].score,
            secondPlayerName: players[1].name,
            secondPlayerScore: players[0].score,
        } as GameInfo;
    }

    private computeTimeLength(date1: Date, date2: Date): string {
        const milliseconds = Math.abs(date2.getTime() - date1.getTime());
        const seconds = (milliseconds / SECOND_IN_MILLISECOND) % SECOND_MINUTE_HOUR_MAX_VALUE;
        const minutes = (milliseconds / (SECOND_IN_MILLISECOND * SECOND_MINUTE_HOUR_MAX_VALUE)) % SECOND_MINUTE_HOUR_MAX_VALUE;
        const hours =
            (milliseconds / (SECOND_IN_MILLISECOND * SECOND_MINUTE_HOUR_MAX_VALUE * SECOND_MINUTE_HOUR_MAX_VALUE)) % SECOND_MINUTE_HOUR_MAX_VALUE;
        return (
            (hours < MINIMUM_TWO_UNITS ? '0' + hours : hours) +
            ':' +
            (minutes < MINIMUM_TWO_UNITS ? '0' + minutes : minutes) +
            ':' +
            (seconds < MINIMUM_TWO_UNITS ? '0' + seconds : seconds)
        );
    }
}
