import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DARK_BLUE, GridService, PINK } from '@app/services/grid.service';
import * as constants from '@common/constants';

describe('GridService', () => {
    let gridService: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 600;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gridService = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        gridService.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(gridService).toBeTruthy();
    });

    // TODO : grid tests need to be done !!
    // drawLetterTile
    // drawLetterPoints
    // drawLetterTileOnBoard
    // drawLetterPointsOnBoard
    // drawStar

    it(' squareWidth should return the width of the grid canvas', () => {
        expect(GridService.squareWidth).toEqual(CANVAS_WIDTH / constants.TOTAL_COLUMNS);
    });

    it(' squareHeight should return the height of a single board tile the grid canvas', () => {
        expect(GridService.squareHeight).toEqual(CANVAS_HEIGHT / constants.TOTAL_ROWS);
    });

    // setTileColor tests
    it(' setTileColor should set a MOT type tile to pink when it is letter multiplier by two', () => {
        gridService.gridContext = jasmine.createSpyObj('gridContext', ['fillStyle']);
        const fillStyleSpy = spyOn(gridService, 'setTileColor').and.callThrough();
        gridService.setTileColor('MOT', 2);
        expect(fillStyleSpy).toHaveBeenCalled();
        expect(gridService.gridContext.fillStyle).toEqual(PINK);
    });

    it(' setTileColor should set a LETTRE type tile to pink when it is letter multiplier by three', () => {
        gridService.gridContext = jasmine.createSpyObj('gridContext', ['fillStyle']);
        const fillStyleSpy = spyOn(gridService, 'setTileColor').and.callThrough();
        gridService.setTileColor('LETTRE', 3);
        expect(fillStyleSpy).toHaveBeenCalled();
        expect(gridService.gridContext.fillStyle).toBe(DARK_BLUE);
    });

    // drawGrid tests below :
    it(' drawGrid should call drawRowNumbers', () => {
        const drawRowNumbersSpy = spyOn(gridService, 'drawRowNumbers').and.callThrough();
        gridService.drawGrid([]);
        expect(drawRowNumbersSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawColumnLetters', () => {
        const drawColumnLetterSpy = spyOn(gridService, 'drawColumnLetters').and.callThrough();
        gridService.drawGrid([]);
        expect(drawColumnLetterSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawBasicTiles', () => {
        const drawBasicTilesSpy = spyOn(gridService, 'drawBasicTiles').and.callThrough();
        gridService.drawGrid([]);
        expect(drawBasicTilesSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawMultipliers', () => {
        const drawMultipliersSpy = spyOn(gridService, 'drawMultipliers').and.callThrough();
        gridService.drawGrid([]);
        expect(drawMultipliersSpy).toHaveBeenCalled();
    });

    it(' drawMiddleTile should call drawMiddleTile', () => {
        const drawMiddleTileSpy = spyOn(gridService, 'drawMiddleTile').and.callThrough();
        gridService.drawGrid([]);
        expect(drawMiddleTileSpy).toHaveBeenCalled();
    });

    // drawGrid prof examples below

    // it(' drawGrid should call moveTo and lineTo 4 times', () => {
    //     const expectedCallTimes = 4;
    //     const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
    //     const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
    //     service.drawGrid([]);
    //     expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    //     expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    // });

    // it(' drawGrid should color pixels on the canvas', () => {
    //     let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
    //     const beforeSize = imageData.filter((x) => x !== 0).length;
    //     service.drawGrid();
    //     imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
    //     const afterSize = imageData.filter((x) => x !== 0).length;
    //     expect(afterSize).toBeGreaterThan(beforeSize);
    // });

    // drawWord prof examples

    // it(' drawWord should call fillText on the canvas', () => {
    //     const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
    //     service.drawWord('test');
    //     expect(fillTextSpy).toHaveBeenCalled();
    // });

    // it(' drawWord should not call fillText if word is empty', () => {
    //     const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
    //     service.drawWord('');
    //     expect(fillTextSpy).toHaveBeenCalledTimes(0);
    // });

    // it(' drawWord should call fillText as many times as letters in a word', () => {
    //     const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
    //     const word = 'test';
    //     service.drawWord(word);
    //     expect(fillTextSpy).toHaveBeenCalledTimes(word.length);
    // });

    // it(' drawWord should color pixels on the canvas', () => {
    //     let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
    //     const beforeSize = imageData.filter((x) => x !== 0).length;
    //     service.drawWord('test');
    //     imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
    //     const afterSize = imageData.filter((x) => x !== 0).length;
    //     expect(afterSize).toBeGreaterThan(beforeSize);
    // });
});
