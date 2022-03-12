import { Application } from '@app/app';
import { ScoreStorageService } from '@app/services/database/score-storage.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('HighScoreController', () => {
    const classicTopScores = [
        { position: '1', username: 'Vincent', type: 'Classique', score: 200 },
        { position: '2', username: 'Pierre', type: 'Classique', score: 50 },
        { position: '3', username: 'Lau', type: 'Classique', score: 30 },
        { position: '4', username: 'George', type: 'Classique', score: 2 },
        { position: '5', username: 'Sang', type: 'Classique', score: 0 },
    ];
    const lOG2990TopScores = [
        { position: '1', username: 'Vincent', type: 'LOG2990', score: 200 },
        { position: '2', username: 'Pierre', type: 'LOG2990', score: 50 },
        { position: '3', username: 'Lau', type: 'LOG2990', score: 30 },
        { position: '4', username: 'George', type: 'LOG2990', score: 2 },
        { position: '5', username: 'Sang', type: 'LOG2990', score: 0 },
    ];
    let scoreStorage: SinonStubbedInstance<ScoreStorageService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        scoreStorage = createStubInstance(ScoreStorageService);
        scoreStorage.getClassicTopScores.resolves(classicTopScores);
        scoreStorage.getLOG2990TopScores.resolves(lOG2990TopScores);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['highScoreController'], 'scoreStorage', { value: scoreStorage });
        expressApp = app.app;
    });

    it('should return array of the HighScore for the Classic category', async () => {
        return supertest(expressApp)
            .get('/highScore/classique')
            .then((response) => {
                expect(response.body).to.deep.equal(classicTopScores);
            });
    });

    it('should return array of the HighScore for the LOG2990 category', async () => {
        return supertest(expressApp)
            .get('/highScore/log2990')
            .then((response) => {
                expect(response.body).to.deep.equal(lOG2990TopScores);
            });
    });
});
