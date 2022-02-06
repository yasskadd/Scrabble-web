import { Service } from 'typedi';
import { ChatboxHandlerService } from './chatbox-handler.service';

@Service()
export class SocketSubscribeHandler {
    constructor(private chatBoxHandlerService: ChatboxHandlerService) {}

    initSocketsEvents() {
        this.chatBoxHandlerService.initSocketsEvents();
        // Ajouter le reste des services qui utilisent des sockets ici!
    }
}
