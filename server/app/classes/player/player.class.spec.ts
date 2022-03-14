import { Gameboard } from '@app/classes/gameboard.class';
import { Game } from '@app/services/game.service';
import { Letter } from '@common/interfaces/letter';
import { expect } from 'chai';
import * as sinon from 'sinon';
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

    it("getInformation() should return the player's information", () => {
        const gameStub = sinon.createStubInstance(Game);
        gameStub.gameboard = { gameboardCoords: [] } as unknown as Gameboard;
        player.game = gameStub as unknown as Game;
        const info = {
            name: player.name,
            score: player.score,
            rack: player.rack,
            room: player.room,
            gameboard: player.game.gameboard.gameboardCoords,
        };
        const result = player.getInformation();
        expect(result).to.be.deep.equal(info);
    });

    it('getInformation() should send an empty object if game is undefined', () => {
        const result = player.getInformation();
        expect(result).to.be.equal({});
    });
});
