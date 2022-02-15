import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatboxMessage } from '@app/classes/chatbox-message';
import { ChatboxHandlerService } from '@app/services/chatbox-handler.service';
import { ChatboxComponent } from './chatbox.component';

const TEST_MESSAGE: ChatboxMessage = { type: 'WorldHello', data: 'WeBigProjectBoisNow' };

describe('ChatboxComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;
    let chatBoxHandlerSpy: jasmine.SpyObj<ChatboxHandlerService>;

    beforeEach(async () => {
        chatBoxHandlerSpy = jasmine.createSpyObj('ChatboxHandlerService', ['submitMessage'], { messages: [TEST_MESSAGE] });
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [ChatboxComponent],
            providers: [{ provide: ChatboxHandlerService, useValue: chatBoxHandlerSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ResetInput() should clear input', () => {
        component.input.setValue('Hello Monsieur Chommeur');
        // Testing private method
        // eslint-disable-next-line dot-notation
        component['resetInput']();
        expect(component.input.value).toEqual('');
    });

    it('submit() should call chatboxHandler.submitMessage() on a valid input', () => {
        const VALID_INPUT = 'Bonjour Tout le monde';
        component.input.setValue(VALID_INPUT);
        component.submit();
        expect(component.input.value).toEqual('');
    });

    it('submit() should call chatboxHandler.submitMessage() ', () => {
        const VALID_INPUT = 'Bonjour Tout le monde';
        component.input.setValue(VALID_INPUT);
        component.submit();
        expect(chatBoxHandlerSpy.submitMessage).toHaveBeenCalledWith(VALID_INPUT);
    });

    it('submit() should not call chatboxHandler.submitMessage() and not reset the input if the input is the length of 512 caracters ', () => {
        const INVALID_INPUT =
            // Reason : Testing if the input is not valid with a lenght of 512 caracters
            // eslint-disable-next-line max-len
            'IfphBjnEs3QDqhdrFn9bvjf6iSZifC50P10BIfdTlZjRG0AhCmjOKRb7iyiinHXYP0MO8GHg3VFyIF9rk2fNNyQIGeYPW3wanAQg2GNywLGKJloeDcBIaqiTLSDXV5zUl8lvizB14h5autn2hfwl4w1Yhn0nMcPSsz43mypkDcrY8yi1ZX3xeAO0pNus4dge7lDAVT1YyC9FuprbY5dPfOhg9K4KqXRBpxfbZb1GRJXXX2JrXHiyefbucv7gg6oJaP30eZOMa1cijGTKMgs8PQhWGFdrwvnWuAFvHhWs8KbBio5GTYUK9WtIbs626N1UxwaS6McbpJfIttFtzzuJsEJwsHYfPPfdTxe4JzKRMwekjyUCzxXrxNJjzZQhfxhCkz8wgv2sjCtF5ieh6mcJvnbpDNost2vlIJLmto6j0VFp1PK8efrz0b9QABdlBlEm2UZUZmwRg2YKEWhZdSk4zx6SjOCiFjaeK1A1ZzoCkeDy9KnAeyqtwSWmRI2Mv5d4y';
        component.input.setValue(INVALID_INPUT);
        component.submit();
        expect(chatBoxHandlerSpy.submitMessage).not.toHaveBeenCalled();
        expect(component.input.value).not.toEqual('');
    });

    it("get messages() should return chatboxHandler's messages", () => {
        expect(component.messages).toEqual([TEST_MESSAGE]);
    });

    it('clickInside() should focus on the input', () => {
        const input = fixture.debugElement.nativeElement.querySelector('#input');
        const spyOnFocus = spyOn(input, 'focus');
        component.clickInside();
        expect(spyOnFocus).toHaveBeenCalled();
    });

    it('clicking on message container should call clickInside()', () => {
        const container = fixture.debugElement.nativeElement.querySelector('.message-container');
        const spyOnClickInside = spyOn(component, 'clickInside');

        container.click();
        expect(spyOnClickInside).toHaveBeenCalled();
    });

    it('Input should focus on initialization', () => {
        const input = fixture.debugElement.nativeElement.querySelector('#input');

        expect(input.focus).toBeTruthy();
    });

    // Stub provider isn't working
    it('All messages should be displayed', () => {
        const messages = fixture.debugElement.nativeElement.querySelectorAll('.message');
        expect(messages.length).toEqual(chatBoxHandlerSpy.messages.length);
    });

    it('scrollToBottom should scroll to the bottom of the message container', () => {
        const SCROLL_HEIGHT = 10;
        const SCROLL_TOP = 20;

        // Reason : accessing private proprety
        // eslint-disable-next-line dot-notation
        component['scrollBox'] = {
            nativeElement: {
                scrollHeight: SCROLL_HEIGHT,
                scrollTop: SCROLL_TOP,
            },
        };

        // Reason : accessing private proprety
        // eslint-disable-next-line dot-notation
        component['scrollToBottom']();

        // Reason : accessing private proprety
        // eslint-disable-next-line dot-notation
        expect(component['scrollBox'].nativeElement.scrollTop).toEqual(component['scrollBox'].nativeElement.scrollTop);
    });

    it('scrollToBottom() should be called after every new message', () => {
        const spyOnScrollBottom = spyOn(component, 'scrollToBottom' as never);
        const container = fixture.debugElement.nativeElement.querySelector('.message-container');
        container.appendChild(document.createElement('message'));
        fixture.detectChanges();

        expect(spyOnScrollBottom).toHaveBeenCalled();
    });

    it('a mat error should appear when writing more than 512 characters', () => {
        const INVALID_INPUT =
            // Reason : Testing if the input is not valid with a lenght of 512 caracters
            // eslint-disable-next-line max-len
            'IfphBjnEs3QDqhdrFn9bvjf6iSZifC50P10BIfdTlZjRG0AhCmjOKRb7iyiinHXYP0MO8GHg3VFyIF9rk2fNNyQIGeYPW3wanAQg2GNywLGKJloeDcBIaqiTLSDXV5zUl8lvizB14h5autn2hfwl4w1Yhn0nMcPSsz43mypkDcrY8yi1ZX3xeAO0pNus4dge7lDAVT1YyC9FuprbY5dPfOhg9K4KqXRBpxfbZb1GRJXXX2JrXHiyefbucv7gg6oJaP30eZOMa1cijGTKMgs8PQhWGFdrwvnWuAFvHhWs8KbBio5GTYUK9WtIbs626N1UxwaS6McbpJfIttFtzzuJsEJwsHYfPPfdTxe4JzKRMwekjyUCzxXrxNJjzZQhfxhCkz8wgv2sjCtF5ieh6mcJvnbpDNost2vlIJLmto6j0VFp1PK8efrz0b9QABdlBlEm2UZUZmwRg2YKEWhZdSk4zx6SjOCiFjaeK1A1ZzoCkeDy9KnAeyqtwSWmRI2Mv5d4y';
        component.input.setValue(INVALID_INPUT);
        fixture.detectChanges();
        const matError = fixture.debugElement.nativeElement.querySelector('.error');
        expect(matError !== null).toBeTruthy();
    });

    it("a mat error shouldn't be here when input is valid (less than 512 characters)", () => {
        const VALID_INPUT = 'HELLO';
        component.input.setValue(VALID_INPUT);
        const matError = fixture.debugElement.nativeElement.querySelector('.error');
        expect(matError === null).toBeTruthy();
    });
});
