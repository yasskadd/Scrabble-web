/* eslint-disable prettier/prettier */
import { expect } from 'chai';
import { Container } from 'typedi';
import { Coordinate } from './coordinate.class';

describe('Coordinate', () => {
    let coordinateClass: Coordinate;

    beforeEach(async () => {
        coordinateClass = Container.get(Coordinate);
    });

    it('should reset letterMultiplier to 1 if resetLetterMultiplier is called', () => {
        coordinateClass.resetLetterMultiplier();
        expect(coordinateClass.letterMultiplier).to.equal(1);
    });
});
