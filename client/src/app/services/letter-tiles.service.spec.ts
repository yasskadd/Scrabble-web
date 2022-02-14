import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LetterTilesService } from './letter-tiles.service';

const CANVAS_HEIGHT = 75;
const CANVAS_WIDTH = 500;
const testPlayerRack = [
    {
        stringChar: 'S',
        quantity: 1,
        points: 3,
    },

    {
        stringChar: 'C',
        quantity: 1,
        points: 3,
    },

    {
        stringChar: 'H',
        quantity: 1,
        points: 3,
    },
];

describe('LetterTilesService', () => {
    let letterTilesService: LetterTilesService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        letterTilesService = TestBed.inject(LetterTilesService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        letterTilesService.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(letterTilesService).toBeTruthy();
    });

    it(' letter tiles of player rack should have a minimum size of 15px', () => {
        const expectedSize = 15;
        expect(letterTilesService.minimumSize).toEqual(expectedSize);
    });

    it(' letter tiles of player rack should have a minimum size of 20px', () => {
        const expectedSize = 20;
        expect(letterTilesService.maxSize).toEqual(expectedSize);
    });

    it(' drawRack should call drawLetterTile 3 times', () => {
        const expected = 3;
        const drawLetterSpy = spyOn(letterTilesService, 'drawLetterTile').and.callThrough();
        letterTilesService.drawRack(testPlayerRack);
        expect(drawLetterSpy).toHaveBeenCalledTimes(expected);
    });

    it(' drawRack should call drawLetterWeight 3 times', () => {
        const expected = 3;
        const drawWeightSpy = spyOn(letterTilesService, 'drawLetterWeight').and.callThrough();
        letterTilesService.drawRack(testPlayerRack);
        expect(drawWeightSpy).toHaveBeenCalledTimes(expected);
    });

    it(' drawRack should call drawLetterWeight 3 times', () => {
        const expected = 3;
        const drawWeightSpy = spyOn(letterTilesService, 'drawLetterWeight').and.callThrough();
        letterTilesService.drawRack(testPlayerRack);
        expect(drawWeightSpy).toHaveBeenCalledTimes(expected);
    });
});
