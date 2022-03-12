import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { LetterPlacementService } from '@app/services/letter-placement.service';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mouseEvent: MouseEvent;
    let letterPlacementServiceSpy: jasmine.SpyObj<LetterPlacementService>;

    beforeEach(async () => {
        letterPlacementServiceSpy = jasmine.createSpyObj('LetterPlacementService', [
            'undoPlacement',
            'submitPlacement',
            'undoEverything',
            'handlePlacement',
            'placeLetterStartPosition',
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [{ provide: LetterPlacementService, useValue: letterPlacementServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('mouseHitDetect should assign the mouse position to mousePosition variable', () => {
        const expectedPosition: Vec2 = { x: 100, y: 200 };
        mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
            button: 0,
        } as MouseEvent;
        component.mouseHitDetect(mouseEvent);
        expect(component.mousePosition).toEqual(expectedPosition);
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers -- Add reason */
    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        mouseEvent = {
            offsetX: expectedPosition.x + 10,
            offsetY: expectedPosition.y + 10,
            button: 1,
        } as MouseEvent;
        component.mouseHitDetect(mouseEvent);
        expect(component.mousePosition).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(component.mousePosition).toEqual(expectedPosition);
    });

    it('mouseHitDetect should call letterService.placeLetterStartPosition ', () => {
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        mouseEvent = {
            offsetX: expectedPosition.x + 10,
            offsetY: expectedPosition.y + 10,
            button: 0,
        } as MouseEvent;
        component.mouseHitDetect(mouseEvent);
        expect(letterPlacementServiceSpy.placeLetterStartPosition).toHaveBeenCalled();
    });

    it("mouseClickOutside should call letterService.undoEverything if the click isn't in the canvas", () => {
        const outsideClickEvent = new MouseEvent('click', { button: 0 });
        component.mouseClickOutside(outsideClickEvent);
        expect(letterPlacementServiceSpy.undoEverything).toHaveBeenCalled();
    });

    it("mouseClickOutside shouldn't call letterService.undoEverything if the click is in the canvas", () => {
        const outsideClickEvent = new MouseEvent('click');
        const node = document.createElement('test') as Node;
        Object.defineProperty(outsideClickEvent, 'target', { value: node as Node, enumerable: true });
        // eslint-disable-next-line dot-notation
        component['gridCanvas'].nativeElement.appendChild(node);
        component.mouseClickOutside(outsideClickEvent);
        expect(letterPlacementServiceSpy.undoEverything).not.toHaveBeenCalled();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('Enter keypress should call letterService.submitPlacement', () => {
        const enterKeypressEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        fixture.debugElement.triggerEventHandler('keydown', enterKeypressEvent);
        expect(letterPlacementServiceSpy.submitPlacement).toHaveBeenCalled();
    });

    it('Backspace keypress should call letterService.undoPlacement', () => {
        const enterKeypressEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        fixture.debugElement.triggerEventHandler('keydown', enterKeypressEvent);
        expect(letterPlacementServiceSpy.undoPlacement).toHaveBeenCalled();
    });

    it('Escape keypress should call letterService.undoEverything', () => {
        const enterKeypressEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        fixture.debugElement.triggerEventHandler('keydown', enterKeypressEvent);
        expect(letterPlacementServiceSpy.undoEverything).toHaveBeenCalled();
    });

    it("Shift keypress shouldn't do anything", () => {
        const enterKeypressEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        fixture.debugElement.triggerEventHandler('keydown', enterKeypressEvent);
        expect(letterPlacementServiceSpy.undoEverything).not.toHaveBeenCalled();
        expect(letterPlacementServiceSpy.undoPlacement).not.toHaveBeenCalled();
        expect(letterPlacementServiceSpy.handlePlacement).not.toHaveBeenCalled();
        expect(letterPlacementServiceSpy.submitPlacement).not.toHaveBeenCalled();
    });

    it('Other keypress should call letterService.handlePlacement', () => {
        const enterKeypressEvent = new KeyboardEvent('keydown', { key: 'a' });
        fixture.debugElement.triggerEventHandler('keydown', enterKeypressEvent);
        expect(letterPlacementServiceSpy.handlePlacement).toHaveBeenCalled();
    });
});
