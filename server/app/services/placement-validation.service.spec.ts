import { Coordinate } from 'app/classes/coordinate.class';
import { GameBoard } from 'app/classes/gameboard.class';
import { Letter } from 'app/classes/letter.class';
import { expect } from 'chai';
import { PlacementValidationService } from './placement-validation.service';
import Sinon = require('sinon');

describe('Placement Validation Service', () => {
    let placementValidationService: PlacementValidationService;
    const letter = new Letter();
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    // eslint-disable-next-line prettier/prettier
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const invalidCoordList: Coordinate[] = [new Coordinate(0, 0, letter), new Coordinate(5, 5, letter), new Coordinate(1, 3, letter)];

    it('should return false if coordinate list would do an invalid placement', () => {
        expect(placementValidationService.validatePlacement(invalidCoordList, GameBoard)).to.be.true;
    });

    it('should return true if coordinate list is horizontal', () => {});

    it('should return true if coordinate list is Vertical', () => {});

    it('should return true if there is only one coordinate and is adjacent to another');
});
