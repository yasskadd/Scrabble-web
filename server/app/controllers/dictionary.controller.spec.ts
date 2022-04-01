import { Application } from '@app/app';
import { DictionaryStorageService } from '@app/services/database/dictionary-storage.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('HighScoreController', () => {
    const dictionaries = [
        { title: 'Premier dicitonnaire', description: 'Un dictionnaire', words: ['string'] },
        { title: 'Deuxieme dicitonnaire', description: 'Un dictionnaire', words: ['string'] },
        { title: 'Troisieme dicitonnaire', description: 'Un dictionnaire', words: ['string'] },
    ];
    let dictionaryStorage: SinonStubbedInstance<DictionaryStorageService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        dictionaryStorage = createStubInstance(DictionaryStorageService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['dictionaryController'], 'dictionaryStorage', { value: dictionaryStorage });
        expressApp = app.app;
    });

    it('should return array of the dictionaries', async () => {
        dictionaryStorage.getAllDictionary.resolves(dictionaries);
        return supertest(expressApp)
            .get('/dictionary')
            .then((response) => {
                expect(response.body).to.deep.equal(dictionaries);
            });
    });

    it('should return status 201 on dictionary post', async () => {
        return supertest(expressApp)
            .post('/dictionary/upload')
            .then((response) => {
                expect(response.status).to.deep.equal(201);
            });
    });
});
