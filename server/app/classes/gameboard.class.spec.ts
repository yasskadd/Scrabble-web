/* eslint-disable prettier/prettier */
import { expect } from 'chai';
import { Container } from 'typedi';
import { GameBoard } from './gameboard.class';

describe('gameboard', () => {
    let gameboard: GameBoard;

    beforeEach(async () => {
        gameboard = Container.get(GameBoard);
    });

    it('should reset letterMultiplier to 1 if resetLetterMultiplier is called', () => {
        coordinateClass.resetLetterMultiplier();
        expect(coordinateClass.letterMultiplier).to.equal(1);
    });
});
