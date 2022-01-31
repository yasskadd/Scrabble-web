import { Service } from 'typedi';
import { Message } from '../message';

@Service()
export class DateService {
    async currentTime(): Promise<Message> {
        return {
            title: 'Time',
            body: new Date().toString(),
        };
    }
}
