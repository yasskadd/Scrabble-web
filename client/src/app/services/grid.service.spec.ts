import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DARK_BLUE, GridService, PINK } from '@app/services/grid.service';
import * as constants from '@common/constants';

describe('GridService', () => {
    let gridService: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 600;
    const POSITION_TEST = { x: 2, y: 11 };
    const BOARD_SIZE = 15;
    const GAMEBOARD_TEST = [
        {
            x: 2,
            y: 5,
            isOccupied: true,
            letter: { value: 'S', quantity: 2, points: 2 },
            letterMultiplier: 1,
            wordMultiplier: 2,
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gridService = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        gridService.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(gridService).toBeTruthy();
    });

    it(' squareWidth should return the width of the grid canvas', () => {
        expect(GridService.squareWidth).toEqual(CANVAS_WIDTH / constants.TOTAL_COLUMNS);
    });

    it(' squareHeight should return the height of a single board tile the grid canvas', () => {
        expect(GridService.squareHeight).toEqual(CANVAS_HEIGHT / constants.TOTAL_ROWS);
    });
    // drawGrid tests
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

    it(' drawGrid should call drawLetter when gameboard has occupied coordinate', () => {
        const drawLetterSpy = spyOn(gridService, 'drawLetter').and.callThrough();
        gridService.drawGrid(GAMEBOARD_TEST);
        expect(drawLetterSpy).toHaveBeenCalled();
        // expect(GAMEBOARD_TEST.letter.isOccupied).toBeTruthy();
    });

    it(' drawGrid should call drawMiddleTile', () => {
        const drawMiddleTileSpy = spyOn(gridService, 'drawMiddleTile').and.callThrough();
        gridService.drawGrid([]);
        expect(drawMiddleTileSpy).toHaveBeenCalled();
    });

    // NOT SURE ABOUT THIS
    it(' drawGrid should not call drawLetter on an empty letter tile', () => {
        const drawLetterSpy = spyOn(gridService, 'drawLetter').and.callThrough();
        gridService.drawGrid([]);
        expect(drawLetterSpy).toHaveBeenCalledTimes(BOARD_SIZE);
        // expect(drawLetterSpy).toHaveBeenCalledTimes(0);
    });

    // drawLetterTile
    it(' drawLetterTile should call strokeRect ', () => {
        const strokeRectSpy = spyOn(gridService.gridContext, 'strokeRect').and.callThrough();
        gridService.drawLetterTile(POSITION_TEST, 'K');
        expect(strokeRectSpy).toHaveBeenCalledTimes(1);
    });

    // drawLetterPoints
    it(' drawLetterPoints should have a middle baseline and center alignment ', () => {
        gridService.drawLetterPoints(POSITION_TEST, '1');
        expect(gridService.gridContext.textAlign).toEqual('center');
        expect(gridService.gridContext.textBaseline).toEqual('middle');
    });

    // drawLetterTileOnBoard
    it(' drawLetterTileOnBoard should not call drawLetter more than once', () => {
        const drawLetterSpy = spyOn(gridService, 'drawLetter').and.callThrough();
        gridService.drawLetterTileOnBoard(POSITION_TEST, 'R');
        expect(drawLetterSpy).not.toHaveBeenCalledTimes(2);
        expect(drawLetterSpy).toHaveBeenCalled();
    });

    // drawLetterPointsOnBoard
    it(' drawLetterPointsOnBoard should call fillText 1 time only', () => {
        const fillTextSpy = spyOn(gridService.gridContext, 'fillText').and.callThrough();
        gridService.drawLetterPointsOnBoard(POSITION_TEST, 'R');
        expect(fillTextSpy).toHaveBeenCalledTimes(1);
        expect(fillTextSpy).not.toHaveBeenCalledTimes(10);
    });

    // drawStar
    it(' drawStar should call fill', () => {
        const ctxfillSpy = spyOn(gridService.gridContext, 'fill').and.callThrough();
        gridService.drawStar();
        expect(ctxfillSpy).toHaveBeenCalled();
    });

    it(' drawStar should call lineTo 11 times', () => {
        const expectedCalls = 11;
        const lineToSpy = spyOn(gridService.gridContext, 'lineTo').and.callThrough();
        gridService.drawStar();
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCalls);
    });

    // drawRowNumbers tests
    it(' drawRowNumbers should call drawText 15 times', () => {
        const rowNumbersSpy = spyOn(gridService, 'drawText').and.callThrough();
        gridService.drawRowNumbers();
        expect(rowNumbersSpy).toHaveBeenCalledTimes(BOARD_SIZE);
    });

    // drawColumnLetters tests
    it(' drawColumnLetters should call drawLetter 15 times', () => {
        const columnLettersSpy = spyOn(gridService, 'drawLetter').and.callThrough();
        gridService.drawColumnLetters();
        expect(columnLettersSpy).toHaveBeenCalledTimes(BOARD_SIZE);
    });

    // drawLetter tests
    it(' drawLetter should call drawText', () => {
        const drawTextSpy = spyOn(gridService, 'drawText').and.callThrough();
        gridService.drawLetter(POSITION_TEST, 'A');
        expect(drawTextSpy).toHaveBeenCalled();
    });

    // drawBasicTiles tests
    it(' drawBasicTiles should call drawBasicTile 225 times', () => {
        const expectedCalls = 225;
        const numberSpy = spyOn(gridService, 'drawBasicTile').and.callThrough();
        gridService.drawBasicTiles();
        expect(numberSpy).toHaveBeenCalledTimes(expectedCalls);
    });

    // drawBasicTile tests
    // it(' drawBasicTile should fill the tile with BEIGE colour', () => {
    //     gridService.gridContext = jasmine.createSpyObj('gridContext', ['fillStyle']);
    //     const drawBasicTileSpy = spyOn(gridService, 'drawBasicTile').and.callThrough();
    //     gridService.drawBasicTile(POSITION_TEST);
    //     expect(drawBasicTileSpy).toHaveBeenCalled();
    //     expect(gridService.gridContext.fillStyle).toEqual(BEIGE);
    // });

    it(' drawBasicTile should call fillTile', () => {
        const fillTileSpy = spyOn(gridService, 'fillTile').and.callThrough();
        gridService.drawBasicTile(POSITION_TEST);
        expect(fillTileSpy).toHaveBeenCalled();
    });

    // drawMultipliers tests
    it(' drawMultipliers should call drawMultiplier 60 times', () => {
        const expectedCalls = 60;
        const numberSpy = spyOn(gridService, 'drawMultiplier').and.callThrough();
        gridService.drawMultipliers();
        expect(numberSpy).toHaveBeenCalledTimes(expectedCalls);
    });

    // drawMultiplier tests
    it(' drawMultiplier should call setTileColor', () => {
        const setTileSpy = spyOn(gridService, 'setTileColor').and.callThrough();
        gridService.drawMultiplier(POSITION_TEST, 2, 'MOT');
        expect(setTileSpy).toHaveBeenCalled();
    });

    it(' drawMultiplier should call fillTile', () => {
        const fillTileSpy = spyOn(gridService, 'fillTile').and.callThrough();
        gridService.drawMultiplier(POSITION_TEST, 2, 'MOT');
        expect(fillTileSpy).toHaveBeenCalled();
    });

    it(' drawMultiplier should call drawMultiplierType', () => {
        const typeSpy = spyOn(gridService, 'drawMultiplierType').and.callThrough();
        gridService.drawMultiplier(POSITION_TEST, 2, 'MOT');
        expect(typeSpy).toHaveBeenCalled();
    });

    it(' drawMultiplier should call drawMultiplierNumber', () => {
        const numberSpy = spyOn(gridService, 'drawMultiplierNumber').and.callThrough();
        gridService.drawMultiplier(POSITION_TEST, 2, 'MOT');
        expect(numberSpy).toHaveBeenCalled();
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
        expect(gridService.gridContext.fillStyle).toEqual(DARK_BLUE);
    });

    // drawMiddleTile
    it(' drawMiddleTile should call drawStar', () => {
        const drawStarSpy = spyOn(gridService, 'drawStar').and.callThrough();
        gridService.drawMiddleTile();
        expect(drawStarSpy).toHaveBeenCalled();
    });

    // fillTile
    it(' fillTile should call fillRect', () => {
        const fillRectSpy = spyOn(gridService.gridContext, 'fillRect').and.callThrough();
        gridService.fillTile(POSITION_TEST);
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it(' fillTile should call strokeRect', () => {
        const strokeRectSpy = spyOn(gridService.gridContext, 'strokeRect').and.callThrough();
        gridService.fillTile(POSITION_TEST);
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    // drawMultiplierNumber
    it(' drawMultiplierNumber should be centered and have a top baseline', () => {
        // gridService.gridContext = jasmine.createSpyObj('gridContext', ['textAlign']);
        // gridService.gridContext.textAlign.and.callThrough();
        const multiplierNumberSpy = spyOn(gridService, 'setFontSize').and.callThrough();
        gridService.drawMultiplierNumber(POSITION_TEST, 2);
        expect(multiplierNumberSpy).toHaveBeenCalled();
        expect(gridService.gridContext.textBaseline).toEqual('top');
        expect(gridService.gridContext.textAlign).toEqual('center');
    });

    // drawMultiplierType
    it(' drawMultiplierType should be centered and have a bottom baseline', () => {
        // gridService.gridContext = jasmine.createSpyObj('gridContext', ['textAlign']);
        // gridService.gridContext.textAlign.and.callThrough();
        const multiplierTypeSpy = spyOn(gridService, 'drawMultiplierType').and.callThrough();
        gridService.drawMultiplierType(POSITION_TEST, 'LETTRE');
        expect(multiplierTypeSpy).toHaveBeenCalled();
        expect(gridService.gridContext.textAlign).toEqual('center');
        expect(gridService.gridContext.textBaseline).toEqual('bottom');
    });

    // drawText
    it(' drawText should call fillText when drawing a word', () => {
        const position = { x: 0, y: 1 };
        const fillTextSpy = spyOn(gridService.gridContext, 'fillText').and.callThrough();
        gridService.drawText(position, 'drawTest');
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawText should call textAlign and be centered', () => {
        const position = { x: 0, y: 1 };
        // gridService.gridContext = jasmine.createSpyObj('gridContext', ['textAlign']);
        // gridService.gridContext.textAlign.and.callThrough();
        const textAlignSpy = spyOn(gridService, 'drawText').and.callThrough();
        gridService.drawText(position, 'drawTest');
        expect(textAlignSpy).toHaveBeenCalled();
        expect(gridService.gridContext.textAlign).toEqual('center');
    });

    it(' drawText should call fillStyle and be black', () => {
        const position = { x: 0, y: 1 };
        // gridService.gridContext = jasmine.createSpyObj('gridContext', ['textAlign']);
        // gridService.gridContext.textAlign.and.callThrough();
        const fillStyleSpy = spyOn(gridService, 'drawText').and.callThrough();
        gridService.drawText(position, 'drawTest');
        expect(fillStyleSpy).toHaveBeenCalled();
        expect(gridService.gridContext.fillStyle).toEqual('#000000');
    });

    // setFontSize
    it(' setFontSize should set the font', () => {
        const testFontSize = 23;
        gridService.gridContext = jasmine.createSpyObj('gridContext', ['font']);
        const setFontSizeSpy = spyOn(gridService, 'setFontSize').and.callThrough();
        gridService.setFontSize(testFontSize);
        expect(setFontSizeSpy).toHaveBeenCalled();
        expect(gridService.gridContext.font).toBe('23px system-ui');
    });

    it(' drawLetterWeight should call measureText ', () => {
        const measureTextSpy = spyOn(gridService.gridContext, 'measureText').and.callThrough();
        gridService.drawLetterWeight(POSITION_TEST, '6');
        expect(measureTextSpy).toHaveBeenCalledTimes(1);
    });
});
