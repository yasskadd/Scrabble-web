import { Server } from 'app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as io from 'socket.io';
// import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';

type SioSignature = SocketManager['sio'];
type SocketType = io.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
type CallbackSignature = (socket: SocketType, ...args: unknown[]) => void;
type OnSioCallbackSignature = (sio: io.Server, socket: SocketType, ...args: unknown[]) => void;

const TEST_ROOM = 'EldenRingHype';
const TEST_MESSAGE = 'RipNoTime';

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    // let clientSocket: Socket;
    let sio: SioSignature;
    let joinCallbackOn: CallbackSignature;
    let emitMessageCallbackOn: CallbackSignature;
    let joinCallbackSio: OnSioCallbackSignature;
    let emitMessageCallbackSio: OnSioCallbackSignature;
    // let changeBooleanCallbackOn: CallbackSignature;
    // let changeBooleanCallbackSio: OnSioCallbackSignature;
    // let testBoolean1: boolean;
    // let testBoolean2: boolean;

    // const urlString = 'http://localhost:5020';
    beforeEach(async () => {
        // testBoolean1 = false;
        // testBoolean2 = false;
        // Reason : we just need to check if the callBack is called, we don't need socket testing
        // eslint-disable-next-line no-unused-vars
        // changeBooleanCallbackOn = (_) => {
        //     testBoolean1 = true;
        // };

        // Reason : we just need to check if the callBack is called, we don't need socket testing
        // eslint-disable-next-line no-unused-vars
        // changeBooleanCallbackSio = (i, _) => {
        //     testBoolean2 = true;
        // };

        joinCallbackOn = (socket) => socket.join(TEST_ROOM);
        emitMessageCallbackOn = (socket) => socket.emit(TEST_MESSAGE);
        joinCallbackSio = (o, socket) => {
            socket.join(TEST_ROOM);
            o.to(TEST_ROOM).emit(TEST_MESSAGE);
        };
        emitMessageCallbackSio = (o, socket) => {
            socket.emit(TEST_ROOM);
            o.to(TEST_ROOM).emit(TEST_MESSAGE);
        };
        server = Container.get(Server);
        server.init();
        service = Container.get(SocketManager);

        // Reason :  to be able to use sio for tests
        // eslint-disable-next-line dot-notation
        sio = service['sio'];
    });

    afterEach(() => {
        sio.close();
        sinon.restore();
    });

    it('on() should create a callback array if empty and add a callback in the array in onEvents', () => {
        service.on('event', joinCallbackOn);

        // Reason: Accessing private property for test
        // eslint-disable-next-line dot-notation
        const callBackEventArray = service['onEvents'].get('event');
        expect(callBackEventArray).to.not.equal(undefined);
        expect(callBackEventArray?.pop()).to.equal(joinCallbackOn);
    });

    it('on() should add a callback in the array if the event array exists in onEvents', () => {
        service.on('event', joinCallbackOn);
        service.on('event', emitMessageCallbackOn);

        // Reason: Accessing private property for test
        // eslint-disable-next-line dot-notation
        const callBackEventArray = service['onEvents'].get('event');
        expect(callBackEventArray?.pop()).to.be.equal(emitMessageCallbackOn);
        expect(callBackEventArray?.pop()).to.be.equal(joinCallbackOn);
    });

    it('io() should create a callback array if empty and add a callback in the array in onAndSioEvents', () => {
        service.io('event', joinCallbackSio);

        // Reason: Accessing private property for test
        // eslint-disable-next-line dot-notation
        const callBackEventArray = service['onAndSioEvents'].get('event');
        expect(callBackEventArray).to.not.equal(undefined);
        expect(callBackEventArray?.pop()).to.equal(joinCallbackSio);
    });

    it('io() should add a callback in the array if the event array exists in onAndSioEvents', () => {
        service.io('event', joinCallbackSio);
        service.io('event', emitMessageCallbackSio);

        // Reason: Accessing private property for test
        // eslint-disable-next-line dot-notation
        const callBackEventArray = service['onAndSioEvents'].get('event');
        expect(callBackEventArray?.pop()).to.be.equal(emitMessageCallbackSio);
        expect(callBackEventArray?.pop()).to.be.equal(joinCallbackSio);
    });

    // TODO : finish this last test

    // it('handleSockets() should subscribe all the events to the sockets', (done) => {
    //     const EVENT = 'eventTest';
    //     service.io(EVENT, changeBooleanCallbackSio);

    //     service.on(EVENT, changeBooleanCallbackOn);

    //     service.handleSockets();

    //     clientSocket = ioClient(urlString);
    //     clientSocket.emit(EVENT);
    //     setTimeout(() => {
    //         expect(testBoolean1).to.be.equal(true);
    //         expect(testBoolean2).to.be.equal(true);
    //         done();
    //     });
    //     clientSocket.close();
    // });
});
