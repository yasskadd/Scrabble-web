/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Letter } from '@common/interfaces/letter';
import { LetterTileInterface } from '@common/interfaces/letter-tile-interface';
import { of } from 'rxjs';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';
import { LetterPlacementService } from './letter-placement.service';

describe('LetterPlacementService', () => {
    let service: LetterPlacementService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let chatboxServiceSpy: jasmine.SpyObj<ChatboxHandlerService>;
    let gameClientServiceSpy: jasmine.SpyObj<GameClientService>;

    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['drawUnfinalizedLetter', 'getPosition', 'drawArrow', 'drawGrid']);
        chatboxServiceSpy = jasmine.createSpyObj('ChatboxHandlerService', ['submitMessage']);
        gameClientServiceSpy = jasmine.createSpyObj('GameClientService', [''], {
            gameboardUpdated: of({}),
            playerOne: { rack: [] },
            playerOneTurn: true,
            gameboard: [],
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: GridService, useValue: gridServiceSpy },
                { provide: ChatboxHandlerService, useValue: chatboxServiceSpy },
                { provide: GameClientService, useValue: gameClientServiceSpy },
            ],
        });
        service = TestBed.inject(LetterPlacementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isOutOfBound should return true if the coordinate is out of bound', () => {
        const COORDINATE_OUT_OF_BOUND_1 = { x: 0, y: -1 };
        const COORDINATE_OUT_OF_BOUND_2 = { x: 20, y: 500 };
        // eslint-disable-next-line dot-notation
        expect(service['isOutOfBound'](COORDINATE_OUT_OF_BOUND_1)).toBeTruthy();
        // eslint-disable-next-line dot-notation
        expect(service['isOutOfBound'](COORDINATE_OUT_OF_BOUND_2)).toBeTruthy();
    });

    it('isOutOfBound should return false if the coordinate is not out of bound', () => {
        const COORDINATE_OUT_OF_BOUND_1 = { x: 5, y: 1 };
        const COORDINATE_OUT_OF_BOUND_2 = { x: 15, y: 15 };
        // eslint-disable-next-line dot-notation
        expect(service['isOutOfBound'](COORDINATE_OUT_OF_BOUND_1)).toBeFalsy();
        // eslint-disable-next-line dot-notation
        expect(service['isOutOfBound'](COORDINATE_OUT_OF_BOUND_2)).toBeFalsy();
    });

    it('getArrayIndex should return the index of the element in the array', () => {
        const COORDINATE_1 = { x: 1, y: 1 };
        const COORDINATE_2 = { x: 15, y: 15 };
        const EXPECTED_INDEX_1 = 0;
        const EXPECTED_INDEX_2 = 224;
        // eslint-disable-next-line dot-notation
        expect(service['getArrayIndex'](COORDINATE_1)).toEqual(EXPECTED_INDEX_1);
        // eslint-disable-next-line dot-notation
        expect(service['getArrayIndex'](COORDINATE_2)).toEqual(EXPECTED_INDEX_2);
    });

    it('incrementByOne should increment the parameter.x by one if isHorizontal is true', () => {
        const COORDINATE = { x: 1, y: 1 };
        const EXPECTED_COORDINATE = { x: 2, y: 1 };
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        // eslint-disable-next-line dot-notation
        service['incrementByOne'](COORDINATE);
        // eslint-disable-next-line dot-notation
        expect(COORDINATE).toEqual(EXPECTED_COORDINATE);
    });

    it('incrementByOne should increment the parameter.y by one if isHorizontal is false', () => {
        const COORDINATE = { x: 1, y: 1 };
        const EXPECTED_COORDINATE = { x: 1, y: 2 };
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = false;
        // eslint-disable-next-line dot-notation
        service['incrementByOne'](COORDINATE);
        // eslint-disable-next-line dot-notation
        expect(COORDINATE).toEqual(EXPECTED_COORDINATE);
    });

    it('setPropreties should set the propreties accordingly', () => {
        // eslint-disable-next-line dot-notation
        service['setPropreties']();
        // eslint-disable-next-line dot-notation
        expect(service['startTile']).toEqual({ x: 0, y: 0 });
        // eslint-disable-next-line dot-notation
        expect(service['placedLetters']).toEqual([]);
        // eslint-disable-next-line dot-notation
        expect(service['isHorizontal']).toEqual(true);
        // eslint-disable-next-line dot-notation
        expect(service['isPlacingActive']).toEqual(false);
        // eslint-disable-next-line dot-notation
        expect(service['hasPlacingEnded']).toEqual(false);
    });

    it("computeNextCoordinate should return the same coordinate if the Tile isn't occupied", () => {
        const COORDINATE = { x: 1, y: 1 };
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual(COORDINATE);
    });

    it('computeNextCoordinate should increment until the next not occupied coordinate', () => {
        const COORDINATE = { x: 1, y: 1 };
        gameClientServiceSpy.gameboard.push({ isOccupied: true } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: true } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual({ x: 3, y: 1 });
    });

    it("computeNextCoordinate should stop incrementing if it's outOfBound ", () => {
        const COORDINATE = { x: 15, y: 15 };
        gameClientServiceSpy.gameboard[224] = { isOccupied: true } as LetterTileInterface;
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        COORDINATE.x++;
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual(COORDINATE);
    });

    it('updateLettersView should draw all Letters that are in placedLetters ', () => {
        const START_COORDINATE = { x: 1, y: 1 };
        const EXPECTED_CALLS = 2;

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);

        // eslint-disable-next-line dot-notation
        service['placedLetters'] = [{} as Letter, {} as Letter];
        // eslint-disable-next-line dot-notation
        service['startTile'] = START_COORDINATE;
        // eslint-disable-next-line dot-notation
        service['updateLettersView']();
        // eslint-disable-next-line dot-notation
        expect(gridServiceSpy.drawUnfinalizedLetter.calls.count()).toEqual(EXPECTED_CALLS);
    });

    it("updateLettersView should draw the arrow if it's not outOfBound", () => {
        const START_COORDINATE = { x: 1, y: 1 };

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);

        // eslint-disable-next-line dot-notation
        service['startTile'] = START_COORDINATE;
        // eslint-disable-next-line dot-notation
        service['updateLettersView']();
        // eslint-disable-next-line dot-notation
        expect(gridServiceSpy.drawArrow).toHaveBeenCalled();
    });

    it("updateLettersView shouldn't draw the arrow if it's outOfBound", () => {
        const START_COORDINATE = { x: 15, y: 15 };

        gameClientServiceSpy.gameboard[224] = { isOccupied: true } as LetterTileInterface;

        // eslint-disable-next-line dot-notation
        service['startTile'] = START_COORDINATE;
        // eslint-disable-next-line dot-notation
        service['updateLettersView']();
        // eslint-disable-next-line dot-notation
        expect(gridServiceSpy.drawArrow).not.toHaveBeenCalled();
    });

    it("findLetterFromRack should return the index of the letter from the rack if it's a normal Letter", () => {
        gameClientServiceSpy.playerOne.rack = [{ value: '*' } as Letter, { value: 'a' } as Letter];
        // eslint-disable-next-line dot-notation
        const index = service['findLetterFromRack']('a');
        // eslint-disable-next-line dot-notation
        expect(index).toEqual(1);
    });

    it("findLetterFromRack should return the index of the letter from the rack if it's a white Letter", () => {
        gameClientServiceSpy.playerOne.rack = [{ value: '*' } as Letter, { value: 'a' } as Letter];
        // eslint-disable-next-line dot-notation
        const index = service['findLetterFromRack']('*');
        // eslint-disable-next-line dot-notation
        expect(index).toEqual(0);
    });

    it("findLetterFromRack should return -1 if the letter's not found", () => {
        const INDEX_NOT_FOUND = -1;
        gameClientServiceSpy.playerOne.rack = [{ value: '*' } as Letter, { value: 'a' } as Letter];
        // eslint-disable-next-line dot-notation
        const index = service['findLetterFromRack']('b');
        // eslint-disable-next-line dot-notation
        expect(index).toEqual(INDEX_NOT_FOUND);
    });

    it("treatLetter should return the same letter if the letter's in lowercase", () => {
        // eslint-disable-next-line dot-notation
        expect(service['treatLetter']('b')).toEqual('b');
    });

    it("treatLetter should return the white letter's value if the letter's in uppercase", () => {
        // eslint-disable-next-line dot-notation
        expect(service['treatLetter']('B')).toEqual('*');
    });

    it('normalizeLetter should return the letter with non special symbols', () => {
        // eslint-disable-next-line dot-notation
        expect(service['normalizeLetter']('Á')).toEqual('A');
        // eslint-disable-next-line dot-notation
        expect(service['normalizeLetter']('ç')).toEqual('c');
        // eslint-disable-next-line dot-notation
        expect(service['normalizeLetter']('é')).toEqual('e');
    });

    it('noLettersPlaced should return true if placedLetters is empty', () => {
        // eslint-disable-next-line dot-notation
        service['placedLetters'] = [];
        // eslint-disable-next-line dot-notation
        expect(service['noLettersPlaced']()).toBeTruthy();
    });

    it('noLettersPlaced should return false if placedLetters is not empty', () => {
        // eslint-disable-next-line dot-notation
        service['placedLetters'] = [{} as Letter];
        // eslint-disable-next-line dot-notation
        expect(service['noLettersPlaced']()).toBeFalsy();
    });

    it('resetGameBoardView should redraw the gameboard', () => {
        // eslint-disable-next-line dot-notation
        service['resetGameBoardView']();
        expect(gridServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it('resetView should reset the propreties and redraw the gameboard', () => {
        const setPropretiesSpy = spyOn(service, 'setPropreties' as never);
        const resetGameBoardViewSpy = spyOn(service, 'resetGameBoardView' as never);
        // eslint-disable-next-line dot-notation
        service['resetView']();
        expect(resetGameBoardViewSpy).toHaveBeenCalled();
        expect(setPropretiesSpy).toHaveBeenCalled();
    });

    it('placeLetter should add the letter to the placedLetters and update the view', () => {
        const LETTER = {} as Letter;
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);
        gameClientServiceSpy.playerOneTurn = true;

        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service.placeLetter(LETTER);
        // eslint-disable-next-line dot-notation
        expect(service['placedLetters'].includes(LETTER)).toBeTruthy();
        expect(updateLettersViewSpy).toHaveBeenCalled();
    });

    it("placeLetter shouldn't do anything if it's not the player's turn", () => {
        const LETTER = {} as Letter;
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);
        // eslint-disable-next-line prettier/prettier
        (Object.getOwnPropertyDescriptor(gameClientServiceSpy, 'playerOneTurn')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        service.placeLetter(LETTER);

        // eslint-disable-next-line dot-notation
        expect(service['placedLetters'].includes(LETTER)).not.toBeTruthy();
        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it('placeLetterStartPosition should update the view', () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 1 });

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);

        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);
        const resetGameBoardViewSpy = spyOn(service, 'resetGameBoardView' as never);

        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = false;

        service.placeLetterStartPosition({ x: 0, y: 0 });

        expect(updateLettersViewSpy).toHaveBeenCalled();
        expect(resetGameBoardViewSpy).toHaveBeenCalled();
    });

    it('placeLetterStartPosition should change the direction if clicked on the same position and update the view', () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 1 });

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);

        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        // eslint-disable-next-line dot-notation
        service['startTile'] = { x: 1, y: 1 };

        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);

        service.placeLetterStartPosition({ x: 0, y: 0 });

        // eslint-disable-next-line dot-notation
        expect(service['isHorizontal']).toBeFalse();
        expect(updateLettersViewSpy).toHaveBeenCalled();
    });

    it("placeLetterStartPosition shouldn't do anything if it's not the player's turn", () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 1 });
        (Object.getOwnPropertyDescriptor(gameClientServiceSpy, 'playerOneTurn')?.get as jasmine.Spy<() => boolean>).and.returnValue(false);

        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);

        service.placeLetterStartPosition({ x: 0, y: 0 });

        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it("placeLetterStartPosition shouldn't do anything if it's outOfBound", () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 16 });
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);

        service.placeLetterStartPosition({ x: 0, y: 0 });
        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it("placeLetterStartPosition shouldn't do anything if it's the tile is occupied", () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 1 });
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);
        gameClientServiceSpy.gameboard.push({ isOccupied: true } as LetterTileInterface);

        service.placeLetterStartPosition({ x: 0, y: 0 });
        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it("placeLetterStartPosition shouldn't do anything if there's placed letters", () => {
        gridServiceSpy.getPosition.and.returnValue({ x: 1, y: 1 });
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTileInterface);

        // eslint-disable-next-line dot-notation
        service['placedLetters'].push({} as Letter);

        service.placeLetterStartPosition({ x: 0, y: 0 });
        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it('undoEverything should resetView and put the letters back in the rack', () => {
        const resetViewSpy = spyOn(service, 'resetView' as never);
        const LETTERS = [{ value: 'a' } as Letter, { value: 'b' } as Letter];

        // eslint-disable-next-line dot-notation
        service['placedLetters'] = LETTERS;

        service.undoEverything();

        expect(gameClientServiceSpy.playerOne.rack).toEqual(LETTERS);
        expect(resetViewSpy).toHaveBeenCalled();
    });

    it('undoPlacement should reset the view and put one letter back in the rack', () => {
        const resetGameBoardViewSpy = spyOn(service, 'resetGameBoardView' as never);
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);

        const LETTERS = [{ value: 'a' } as Letter, { value: 'b' } as Letter];

        // eslint-disable-next-line dot-notation
        service['placedLetters'] = LETTERS;

        service.undoPlacement();

        expect(gameClientServiceSpy.playerOne.rack).toEqual([{ value: 'b' } as Letter]);
        expect(resetGameBoardViewSpy).toHaveBeenCalled();
        expect(updateLettersViewSpy).toHaveBeenCalled();
    });

    it("undoPlacement shouldn't do anything if there's no placed letters", () => {
        const resetGameBoardViewSpy = spyOn(service, 'resetGameBoardView' as never);
        const updateLettersViewSpy = spyOn(service, 'updateLettersView' as never);

        // eslint-disable-next-line dot-notation
        service['placedLetters'] = [];

        service.undoPlacement();

        expect(resetGameBoardViewSpy).not.toHaveBeenCalled();
        expect(updateLettersViewSpy).not.toHaveBeenCalled();
    });

    it('submitPlacement should send the letters placed when the direction is horizontal', () => {
        // eslint-disable-next-line dot-notation
        service['placedLetters'].push({ value: 'a' } as Letter);
        // eslint-disable-next-line dot-notation
        service['startTile'] = { x: 1, y: 1 };
        service.submitPlacement();
        expect(chatboxServiceSpy.submitMessage).toHaveBeenCalledWith('!placer a1h a');
    });

    it('submitPlacement should send the letters placed when the direction is vertical', () => {
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = false;
        // eslint-disable-next-line dot-notation
        service['placedLetters'].push({ value: 'a' } as Letter);
        // eslint-disable-next-line dot-notation
        service['startTile'] = { x: 1, y: 1 };
        service.submitPlacement();
        expect(chatboxServiceSpy.submitMessage).toHaveBeenCalledWith('!placer a1v a');
    });

    it("submitPlacement shouldn't do anything if there's no placed letters", () => {
        service.submitPlacement();
        expect(chatboxServiceSpy.submitMessage).not.toHaveBeenCalled();
    });

    it("handlePlacement should place a nomral letter if it's in the rack", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = false;

        const LETTER = { value: 'a' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('a');
        expect(placeLetterSpy).toHaveBeenCalled();
    });

    it("handlePlacement should place a white letter if it's in the rack", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = false;
        const LETTER = { value: '*' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('E');
        expect(placeLetterSpy).toHaveBeenCalled();
    });

    it("handlePlacement should place a special letter if it's in the rack", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = false;
        const LETTER = { value: 'e' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('é');
        expect(placeLetterSpy).toHaveBeenCalled();
    });

    it("handlePlacement shouldn't place a letter if it's not in the rack", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = false;
        const LETTER = { value: 'a' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('e');
        expect(placeLetterSpy).not.toHaveBeenCalled();
    });

    it("handlePlacement shouldn't the placement isn't active", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = false;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = false;
        const LETTER = { value: 'a' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('a');
        expect(placeLetterSpy).not.toHaveBeenCalled();
    });

    it("handlePlacement shouldn't the placement has ended", () => {
        // eslint-disable-next-line dot-notation
        service['isPlacingActive'] = true;
        // eslint-disable-next-line dot-notation
        service['hasPlacingEnded'] = true;
        const LETTER = { value: 'a' } as Letter;
        const placeLetterSpy = spyOn(service, 'placeLetter' as never);
        gameClientServiceSpy.playerOne.rack.push(LETTER);
        service.handlePlacement('a');
        expect(placeLetterSpy).not.toHaveBeenCalled();
    });
});
