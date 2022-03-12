import { TestBed } from '@angular/core/testing';
import { Letter } from '@common/letter';
import { LetterTile } from '@common/letter-tile.class';
import { of } from 'rxjs';
import { ChatboxHandlerService } from './chatbox-handler.service';
import { GameClientService } from './game-client.service';
import { GridService } from './grid.service';
import { LetterPlacementService } from './letter-placement.service';

fdescribe('LetterPlacementService', () => {
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
            playerOneTurn: false,
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
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual(COORDINATE);
    });

    it('computeNextCoordinate should increment until the next not occupied coordinate', () => {
        const COORDINATE = { x: 1, y: 1 };
        gameClientServiceSpy.gameboard.push({ isOccupied: true } as LetterTile);
        gameClientServiceSpy.gameboard.push({ isOccupied: true } as LetterTile);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual({ x: 3, y: 1 });
    });

    it("computeNextCoordinate should stop incrementing if it's outOfBound ", () => {
        const COORDINATE = { x: 15, y: 15 };
        gameClientServiceSpy.gameboard[224] = { isOccupied: true } as LetterTile;
        // eslint-disable-next-line dot-notation
        service['isHorizontal'] = true;
        COORDINATE.x++;
        // eslint-disable-next-line dot-notation
        expect(service['computeNextCoordinate'](COORDINATE)).toEqual(COORDINATE);
    });

    it('updateLettersView should draw all Letters that are in placedLetters ', () => {
        const START_COORDINATE = { x: 1, y: 1 };
        const EXPECTED_CALLS = 2;

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);
        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);

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

        gameClientServiceSpy.gameboard.push({ isOccupied: false } as LetterTile);

        // eslint-disable-next-line dot-notation
        service['startTile'] = START_COORDINATE;
        // eslint-disable-next-line dot-notation
        service['updateLettersView']();
        // eslint-disable-next-line dot-notation
        expect(gridServiceSpy.drawArrow).toHaveBeenCalled();
    });

    it("updateLettersView shouldn't draw the arrow if it's outOfBound", () => {
        const START_COORDINATE = { x: 15, y: 15 };

        gameClientServiceSpy.gameboard[224] = { isOccupied: true } as LetterTile;

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
});
