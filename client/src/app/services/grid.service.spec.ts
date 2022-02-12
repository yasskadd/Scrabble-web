import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService, PINK } from '@app/services/grid.service';
import * as constants from '@common/constants';

describe('GridService', () => {
    let gridService: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

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

    it(' squareWidth should return the width of the grid canvas', () => {
        expect(GridService.squareWidth).toEqual(CANVAS_WIDTH / constants.TOTAL_COLUMNS);
    });

    it(' squareHeight should return the height of a single board tile the grid canvas', () => {
        expect(GridService.squareHeight).toEqual(CANVAS_HEIGHT / constants.TOTAL_ROWS);
    });

    // setTileColor tests
    it(' setTileColor should set a MOT type tile to pink when it is letter multipier by two', () => {
        const fillStyleSpy = spyOn(gridService.setTileColor, 'fillStyle').and.callThrough();
        gridService.setTileColor('MOT', 2);
        expect(ctxStub.fillStyle).toHaveBeenCalled();
        expect(fillStyleSpy).toBe(PINK);
    });

    // drawGrid tests below :
    it(' drawGrid should call drawRowNumbers', () => {
        const privateSpy = spyOn(gridService.gridContext, 'drawRowNumbers');
        gridService.drawGrid();
        expect(privateSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawColumnLetters', () => {
        const privateSpy = spyOn(gridService.gridContext, 'drawColumnLetters');
        gridService.drawGrid();
        expect(privateSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawBasicTiles', () => {
        const privateSpy = spyOn(gridService.gridContext, 'drawBasicTiles');
        gridService.drawGrid();
        expect(privateSpy).toHaveBeenCalled();
    });

    it(' drawGrid should call drawMultipliers', () => {
        const privateSpy = spyOn(gridService.gridContext, 'drawMultipliers');
        gridService.drawGrid();
        expect(privateSpy).toHaveBeenCalled();
    });

    it(' drawMiddleTile should call drawMiddleTile', () => {
        const privateSpy = spyOn(gridService.gridContext, 'drawMiddleTile');
        gridService.drawGrid();
        expect(privateSpy).toHaveBeenCalled();
    });

    // drawGrid prof examples below

    it(' drawGrid should call moveTo and lineTo 4 times', () => {
        const expectedCallTimes = 4;
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

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

    it(' drawWord should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawWord('');
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

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
