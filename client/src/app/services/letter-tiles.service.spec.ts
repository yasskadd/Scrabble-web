import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LetterTilesService } from './letter-tiles.service';

const CANVAS_HEIGHT = 75;
const CANVAS_WIDTH = 500;
const testPlayerRack = [
    {
        value: 'S',
        quantity: 1,
        points: 3,
    },

    {
        value: 'C',
        quantity: 1,
        points: 3,
    },

    {
        value: 'H',
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

    it(' drawLetterTile should call fillText ', () => {
        const fillTextSpy = spyOn(letterTilesService.gridContext, 'fillText').and.callThrough();
        letterTilesService.drawLetterTile(3, 1, 'Z');
        expect(fillTextSpy).toHaveBeenCalledTimes(1);
    });

    it(' drawLetterTile should call strokeRect ', () => {
        const strokeRectSpy = spyOn(letterTilesService.gridContext, 'strokeRect').and.callThrough();
        letterTilesService.drawLetterTile(0, 1, 'K');
        expect(strokeRectSpy).toHaveBeenCalledTimes(1);
    });

    it(' drawLetterTile should have a middle baseline and center alignment ', () => {
        letterTilesService.drawLetterTile(0, 1, 'R');
        expect(letterTilesService.gridContext.textAlign).toEqual('center');
        expect(letterTilesService.gridContext.textBaseline).toEqual('middle');
    });

    it(' drawLetterWeight should call fillText ', () => {
        const fillTextSpy = spyOn(letterTilesService.gridContext, 'fillText').and.callThrough();
        letterTilesService.drawLetterWeight(0, 1, '6');
        expect(fillTextSpy).toHaveBeenCalledTimes(1);
    });

    it(' drawLetterWeight should call measureText ', () => {
        const measureTextSpy = spyOn(letterTilesService.gridContext, 'measureText').and.callThrough();
        letterTilesService.drawLetterWeight(1, 0, '6');
        expect(measureTextSpy).toHaveBeenCalledTimes(1);
    });

    it(' drawLetterWeight should have a middle baseline and center alignment ', () => {
        letterTilesService.drawLetterWeight(0, 1, '7');
        expect(letterTilesService.gridContext.textAlign).toEqual('center');
        expect(letterTilesService.gridContext.textBaseline).toEqual('middle');
    });
});
