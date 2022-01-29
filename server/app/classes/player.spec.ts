import { expect } from 'chai';
import { describe } from 'mocha';
import { Player } from './player';

describe('Player', () => {
    it('should create a simple Player', () => {
        const createdMessage = 'Course created successfuly';
        const httpException: HttpException = new Player(createdMessage);

        expect(httpException.message).to.equals(createdMessage);
    });
});
