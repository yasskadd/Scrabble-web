import { Letter } from '@common/letter';
import { expect } from 'chai';
import { Player } from './player.class';

describe('Player', () => {
    let player: Player;
    beforeEach(() => {
        player = new Player('player');
    });

    it('should return true if the rack is empty', () => {
        const isEmpty = player.rackIsEmpty();
        expect(isEmpty).to.equal(true);
    });

    it('should return false if the rack is not empty', () => {
        player.rack = [{} as Letter];
        const isEmpty = player.rackIsEmpty();
        expect(isEmpty).to.equal(false);
    });

    it('rackToString() should convert rack list to string', () => {
        player.rack = [{ value: 'l' } as Letter, { value: 'e' } as Letter];
        expect(player.rackToString()).to.eql(['l', 'e']);
    });
});
