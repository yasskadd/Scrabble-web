import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    timerToMinute(time: number): number {
        const second = 60;
        return Math.floor(time / second);
    }

    timerToSecond(timer: number): number {
        const minute = 60;
        const second = 60;
        const hour = minute * second;
        return timer - Math.floor(timer / hour) * hour - Math.floor((timer - Math.floor(timer / hour) * hour) / second) * minute;
    }

    secondToMinute(time: number): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const minute = Math.floor(time / 60);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const second = time - minute * 60;

        if (second === 0) {
            return minute.toString() + ':00 minutes';
        } else {
            return minute.toString() + ':30 minutes';
        }
    }
}
