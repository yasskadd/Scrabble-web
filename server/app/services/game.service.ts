import { Message } from '@app/message';
import { Service } from 'typedi';

@Service()
export class GameService {
    clientMessages: Message[];
    constructor() {
    }

    end() {
    }
}
